import React, { useState, useEffect } from 'react';
import {
  StatemanagerContextConsumer,
  StatemanagerContextProvider,
  TheseContextProvider,
  TheseContextConsumer,
} from './context';
import useObjectState from './hooks/useObjectState';
// import compareObjects from './utils/compareObjects';

export function Provider(props) {
  const [contexts, setContexts] = useState([]);
  const [statemanager, setStatemanager] = useState({});
  const [stores, setStores] = useState([]);
  const [these, setThese] = useState(null);

  useEffect(() => {
    setContexts(props.stores.map((store, i) => React.createContext({ store })));
  }, []);

  useEffect(() => {
    setStatemanager({
      provider: ProviderTree,
      contexts: Array.from(contexts),
      content: props.children,
      stores: props.stores,
    });
  }, [contexts]);

  useEffect(() => {
    const stores = {};
    contexts.forEach((context, i) => {
      stores[props.stores[i].name] = context.Consumer;
    });
    setStores(stores);
  }, [statemanager]);

  useEffect(() => {
    console.log('these', these);
  }, [these]);

  return (
    <React.Fragment>
      <TheseContextProvider value={{ these: these, setThese: setThese }}>
        <StatemanagerContextProvider value={{ stores }}>
          {'provider' in statemanager ? (
            React.createElement(statemanager.provider, {
              contexts: statemanager.contexts,
              content: statemanager.content,
              stores: statemanager.stores,
              theseFinal: these,
              stores: {},
            })
          ) : (
            <div>Statemanager Error</div>
          )}
        </StatemanagerContextProvider>
      </TheseContextProvider>
    </React.Fragment>
  );
}

const SetTheseAction = (props) => {
  useEffect(() => {
    // console.log('props', props);
    // console.log('prop.value', props.value);
    props.action(props.value);
    // console.log('props.storesCallback()', props.storesCallback());
    props.storesCallback();
  }, [props.value]);
  return props.children;
};

const SetThese = (props) => {
  useEffect(() => {
    // console.log('props', props);
    // console.log('prop.value', props.value);
    // props.action(props.value);
    console.log('props.storesCallback()', props.storesCallback());
  }, []);
  return (
    <TheseContextConsumer>
      {(context) => {
        return (
          <SetTheseAction
            value={props.these}
            action={context.setThese}
            storesCallback={props.storesCallback}
          >
            {props.children}
          </SetTheseAction>
        );
      }}
    </TheseContextConsumer>
  );
};

export function ProviderTree(props) {
  const [state, setState] = useObjectState({});
  const [stores, setStores] = useState({});
  const [inited, setInited] = useState(false);

  useEffect(() => {
    console.log('this', this);
    const model =
      props.stores.length > 0
        ? { ...props.stores[0].initialState }
        : { ...props.stores.initialState };
    model.setState = setState;
    const actions = Object.entries(
      props.stores.length > 0
        ? { ...props.stores[0].actions }
        : { ...props.stores.actions }
    ).map((entry) => {
      return [entry[0], entry[1].bind(model)];
    });
    Object.assign(model, Object.fromEntries(actions));
    setState(model);
    let theseTemp = props.these || {};
    // console.log('props', props);
    if (props.stores[0]) {
      theseTemp = Object.assign({}, props.these, {
        [props.stores[0].name]: model,
      });
      Object.keys(theseTemp).forEach((key) => {
        if (key === 'undefined') {
          delete theseTemp[key];
        }
      });
      const reactions =
        props.stores.length > 0
          ? { ...props.stores[0].reactions }
          : { ...props.stores.reactions };
      reactions.forEach(([reaction, variable]) => {
        useEffect(reaction, [variable]);
      });
    }
    // console.log(props.stores[0]?.name, model);
    setStores(theseTemp);
    setInited(true);
    console.log('propsstores', props.stores);
  }, []);

  useEffect(() => {
    console.log('localThese', stores);
  }, [stores]);

  const storesCallbackF = (stores) => {
    setStores(stores);
    setState(stores);
    console.log('testtest');
  };

  return (
    <React.Fragment>
      {props.contexts.length > 0 &&
      Object.values(stores).length > 0 &&
      inited ? (
        <div>
          {props.contexts[0].hasOwnProperty('Provider') ? (
            React.createElement(
              props.contexts[0].Provider,
              {
                value: {
                  ...state,
                },
              },
              <ProviderTree
                contexts={props.contexts.slice(1, props.contexts.length)}
                content={props.content}
                stores={props.stores.slice(1, props.stores.length)}
                lastStores={props.stores}
                these={stores}
                theseFinal={props.theseFinal}
                storesCallback={storesCallbackF}
              />
            )
          ) : (
            <div>Provider Tree Error</div>
          )}
        </div>
      ) : (
        <SetThese
          these={stores}
          storesCallback={() => {
            console.log('props', props);
            if ('lastStores' in props) {
              const model =
                props.lastStores.length > 0
                  ? { ...props.lastStores[0].initialState }
                  : { ...props.lastStores.initialState };
              model.setState = setState;
              const actions = Object.entries(
                props.lastStores.length > 0
                  ? { ...props.lastStores[0].actions }
                  : { ...props.lastStores.actions }
              ).map((entry) => {
                return [entry[0], entry[1].bind(model)];
              });
              Object.assign(model, Object.fromEntries(actions));
              let theseTemp = props.these || {};
              if (props.lastStores[0]) {
                theseTemp = Object.assign({}, props.these, {
                  [props.lastStores[0].name]: model,
                });
                Object.keys(theseTemp).forEach((key) => {
                  if (key === 'undefined') {
                    delete theseTemp[key];
                  }
                });
                // console.log('theseTemp', theseTemp);
              }
              props.storesCallback(theseTemp);
            }
          }}
        >
          {props.content}
        </SetThese>
      )}
    </React.Fragment>
  );
}

export const ConsumerTree = (props) => {
  const renderContent = (stores) => {
    Object.keys(stores).forEach((key) => {
      if (key === 'undefined') {
        delete stores[key];
      }
    });
    if (Array.isArray(props.content) > 0) {
      const childrenWithStore = props.content.map((child, i) => {
        return React.cloneElement(
          child,
          {
            ...child.props,
            ...stores,
            key: i,
          },
          child.children
        );
      });
      return childrenWithStore;
    }
    const child = React.cloneElement(props.content, {
      ...stores,
    });
    return child;
  };
  const Consumer = props.consumers[props.stores[0]];
  return (
    <React.Fragment>
      {props.stores.length > 0 ? (
        <React.Fragment>
          <Consumer>
            {(context) => {
              const contexts = Object.assign({}, props.contexts, {
                [props.stores[0]]: context,
              });
              return (
                <ConsumerTree
                  consumers={props.consumers}
                  stores={Array.from(props.stores).slice(
                    1,
                    props.stores.length
                  )}
                  lastContextName={props.stores}
                  content={props.content}
                  contexts={contexts}
                  newContext={context}
                  contextName={props.stores[0]}
                />
              );
            }}
          </Consumer>
        </React.Fragment>
      ) : (
        <React.Fragment>
          {renderContent(
            Object.assign({}, props.contexts, {
              [props.lastContextName]: props.newContext,
            })
          )}
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export const StoresConsumer = (props) => {
  return (
    <StatemanagerContextConsumer>
      {(context) => {
        if (Object.keys(context.stores).length > 0) {
          return (
            <ConsumerTree
              stores={props.stores}
              consumers={context.stores}
              contexts={{}}
              content={props.children}
            />
          );
        }
        return <div>Loading</div>;
      }}
    </StatemanagerContextConsumer>
  );
};
export default {
  Provider,
  StoresConsumer,
};
