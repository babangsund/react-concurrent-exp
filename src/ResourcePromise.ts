enum Status {
  Pending,
  Success,
  Error
}

export type ReadResult<TResource> = null | Error | TResource;

export interface IResourcePromise<TResource> {
  id: number;
  read(): ReadResult<TResource>;
}

class ResourcePromise<TResource> implements IResourcePromise<TResource> {
  static _id = 0;

  id: number;
  _status: Status;
  _result: ReadResult<TResource>;
  _suspender: Promise<Error | TResource>;

  constructor(resourcePromise: Promise<TResource>) {
    this.id = ResourcePromise._id++;
    this._result = null;
    this._status = Status.Pending;
    this._suspender = resourcePromise.then(this._onSuccess, this._onError);
  }

  _onSuccess = (result: TResource) => {
    this._status = Status.Success;
    this._result = result;
    return result;
  };

  _onError = (error: Error) => {
    this._status = Status.Error;
    this._result = error;
    return error;
  };

  read() {
    switch (this._status) {
      case Status.Pending:
        throw this._suspender;
      case Status.Success:
        return this._result;
      case Status.Error:
        throw this._result;
    }
  }
}

export { ResourcePromise };
