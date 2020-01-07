enum Status {
  Pending,
  Success,
  Error
}

class ResourcePromise<TResource> {
  _status: Status;
  _result: null | Error | TResource;
  _suspender: Promise<Error | TResource>;

  constructor(resourcePromise: Promise<TResource>) {
    this._result = null;
    this._status = Status.Pending;
    this._suspender = resourcePromise.then(this._onSuccess, this._onError);
  }

  _onSuccess(result: TResource) {
    this._status = Status.Success;
    this._result = result;
    return result;
  }

  _onError(error: Error) {
    this._status = Status.Error;
    this._result = error;
    return error;
  }

  read() {
    switch (this._status) {
      case Status.Pending:
        throw this._suspender;
      case Status.Success:
        return this._result;
      case Status.Error:
        throw this._result;
      default:
        break;
    }
  }
}

export default ResourcePromise;
