import React from "react";

import "./App.css";
import logo from "./logo.svg";

import { ErrorBoundary } from "./ErrorBoundary";
import { IResourcePromise } from "./ResourcePromise";
import { fetchResource, fetchImage } from "./fetchResource";

interface IUser {
  userName: string;
  firstName: string;
}

interface IPost {
  id: number;
  text: string;
}

interface IAppResource {
  user: IResourcePromise<IUser>;
  posts: IResourcePromise<Array<IPost>>;
  images: IResourcePromise<Array<string>>;
}

interface ResourceProps {
  resource: IAppResource;
}

interface ImgProps {
  src: string;
}

// Weird internal type issue excludes "together" in some cases.
type DirectionalRevealOrder = "forwards" | "backwards";

const SUSPENSE_CONFIG = { timeoutMs: 450 };

let n = 0;
function fetchAppResource(): IAppResource {
  return {
    user: fetchResource({
      firstName: "Benjamin",
      userName: "babangsund"
    }),
    posts: fetchResource([
      { id: 1, text: "a" + n++ },
      { id: 2, text: "b" + n++ }
    ]),
    images: fetchResource(
      Array(3)
        .fill(0)
        .map((_, i) => `https://picsum.photos/200?random=${i + n}`)
    )
  };
}

const App: React.FC = () => {
  const [startTransition, isPending] = React.useTransition(SUSPENSE_CONFIG);
  const [resource, setResource] = React.useState<IAppResource>(() =>
    fetchAppResource()
  );

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <button
          disabled={isPending}
          onClick={() => {
            startTransition(() => {
              setResource(fetchAppResource());
            });
          }}
        >
          Refetch resource
        </button>
        <List resource={resource} />
      </header>
    </div>
  );
};

const Fallback = <article>Loading...</article>;

const User: React.FC<ResourceProps> = ({ resource }) => {
  const user = resource.user.read() as IUser;
  return (
    <article>
      <p>{user.firstName}</p>
      <p>{user?.userName}</p>
    </article>
  );
};

const Posts: React.FC<ResourceProps> = ({ resource }) => {
  const posts = resource.posts.read() as Array<IPost>;
  return (
    <article>
      {posts?.map(todo => (
        <div key={todo.id}>{todo.text}</div>
      ))}
    </article>
  );
};

const Img: React.FC<ImgProps> = ({ src }) => {
  const img = fetchImage(src).read();
  return <img src={img as string} alt="" />;
};

const Images: React.FC<ResourceProps & {
  revealOrder: DirectionalRevealOrder;
}> = ({ resource, revealOrder }) => {
  const images = resource.images.read() as Array<string>;
  return (
    <article>
      <React.SuspenseList revealOrder={revealOrder}>
        {images?.map(src => (
          <React.Suspense key={src} fallback={<img alt="Loading..." />}>
            <Img src={src} />
          </React.Suspense>
        ))}
      </React.SuspenseList>
    </article>
  );
};

const List: React.FC<ResourceProps> = ({ resource }) => {
  const [revealOrder, setRevealOrder] = React.useState<DirectionalRevealOrder>(
    "forwards"
  );

  return (
    <div>
      <select
        value={revealOrder}
        onChange={event =>
          setRevealOrder(event.target.value as DirectionalRevealOrder)
        }
      >
        {["forwards", "backwards"].map(ro => {
          return (
            <option key={ro} value={ro}>
              {ro}
            </option>
          );
        })}
      </select>
      <div>
        <React.SuspenseList revealOrder={revealOrder}>
          <ErrorBoundary>
            <React.Suspense fallback={Fallback}>
              <User resource={resource} />
            </React.Suspense>
          </ErrorBoundary>
          <ErrorBoundary>
            <React.Suspense fallback={Fallback}>
              <Posts resource={resource} />
            </React.Suspense>
          </ErrorBoundary>
          <ErrorBoundary>
            <React.Suspense fallback={Fallback}>
              <Images resource={resource} revealOrder={revealOrder} />
            </React.Suspense>
          </ErrorBoundary>
        </React.SuspenseList>
      </div>
    </div>
  );
};

export default App;
