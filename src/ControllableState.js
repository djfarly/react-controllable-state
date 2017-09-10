import { Component } from 'react';
import PropTypes from 'prop-types';
import {
  UpdateTypes,
  mapObject,
  cbToCb,
  noop,
  defaultSetterName,
  isFunction,
  valueFrom,
  updateHandlerError
} from './utils';

export class ControllableState extends Component {
  static propTypes = {
    children: PropTypes.func.isRequired,
    states: PropTypes.objectOf(
      PropTypes.shape({
        value: PropTypes.any,
        updateHandler: PropTypes.func,
        initialValue: PropTypes.any.isRequired,
        setterName: PropTypes.string,
        notifyOnUpdate: PropTypes.bool,
        handlers: PropTypes.func
      })
    ).isRequired
  };

  state = {};

  constructor(props) {
    super(props);
    const { states } = props;

    this.state = mapObject(states, ({ initialValue }, stateKey) => ({
      [stateKey]: initialValue
    }));
  }

  isControlled = stateKey => {
    const { states } = this.props;

    return (
      states.hasOwnProperty(stateKey) && states[stateKey].value !== undefined
    );
  };

  internallySetState(stateKey, nextState, callback) {
    const { states } = this.props;

    if (this.isControlled(stateKey)) {
      const currentValue = states[stateKey].value;
      // if the state is controlled,
      // we need to call the external handler fn,
      // prev state is from current props
      this.callUpdateHandler({
        stateKey,
        updatedState: valueFrom(nextState, currentValue),
        callback,
        type: UpdateTypes.Mandate
      });
    } else {
      // if the state is _not_ controlled,
      // we need to update our internal state,
      // prev state is from setState fn
      this.setState(
        prevState => ({
          [stateKey]: valueFrom(nextState, prevState[stateKey])
        }),
        () => {
          // notify the outside world even if the state is not controlled
          if (states[stateKey].notifyOnUpdate) {
            this.callUpdateHandler({
              stateKey,
              updatedState: this.state[stateKey],
              type: UpdateTypes.Notification
            });
          }
          // since the update already happend, we'll call the handler right now
          cbToCb(callback)();
        }
      );
    }
  }

  callUpdateHandler = ({ stateKey, updatedState, callback, type }) => {
    const { states } = this.props;
    let updateHandler = states[stateKey] && states[stateKey].updateHandler;

    if (isFunction(updateHandler)) {
      updateHandler(updatedState, cbToCb(callback), type);
    } else if ((type = UpdateTypes.Mandate)) {
      updateHandlerError(stateKey);
    }
  };

  stateSettersAndHandlers = () => {
    const { states } = this.props;

    return mapObject(states, ({ setterName, handlers }, stateKey) => {
      setterName = setterName || defaultSetterName(stateKey);
      const setterFn = (nextState, callback) =>
        this.internallySetState(stateKey, nextState, callback);

      let handlersObj = {};
      if(isFunction(handlers)) {
        handlersObj = handlers(setterFn);
      }

      return {
        [setterName]: setterFn,
        ...handlersObj
      };
    });
  };

  states = () => {
    const { states } = this.props;

    return mapObject(states, (_, stateKey) => {
      return {
        [stateKey]: this.stateFor(stateKey)
      };
    });
  };

  stateFor = stateKey => {
    const { states } = this.props;

    return this.isControlled(stateKey)
      ? states[stateKey].value
      : this.state[stateKey];
  };

  /*

  // Experimental binds for your normal kind of inputs

  internallyHandleInputChange = stateKey => event => {
    const { type, checked, value } = event.target;
    const nextState = type === 'checkbox' ? checked : value;

    this.internallySetState(stateKey, nextState);
  };

  bindInputToState = stateKey => ({
    onChange: this.internallyHandleInputChange(stateKey),
    value: this.stateFor(stateKey)
  });

  bindCheckboxToState = stateKey => ({
    onChange: this.internallyHandleInputChange(stateKey),
    checked: !!this.stateFor(stateKey)
  });

  */

  render() {
    const { props, states, stateSettersAndHandlers } = this;
    const { children } = props;

    return children({
      ...states(),
      ...stateSettersAndHandlers()
    });
  }
}
