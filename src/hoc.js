import React, { Component } from 'react';
import {
  defaultSetterName,
  defaultUpdateHandlerName,
  mapObject,
  valueFrom,
  noop
} from './utils';
import { ControllableState } from './ControllableState';

/**
 * creates a higher order state configuration
 * 
 * @param {Object} higherOrderStates a state configuration
 * @return {Function} the higher order component
 */
export function withControllableState(higherOrderStates) {
  // prepare states object with sensible defaults
  higherOrderStates = mapObject(
    higherOrderStates,
    (
      {
        initialValue = noop,
        setterName,
        updateHandlerName,
        notifyOnUpdate = false,
        handlers = null
      },
      stateKey
    ) => ({
      [stateKey]: {
        initialValue,
        setterName: setterName || defaultSetterName(stateKey),
        updateHandlerName:
          updateHandlerName || defaultUpdateHandlerName(stateKey),
        notifyOnUpdate,
        handlers
      }
    })
  );

  // pre-calc update handler and state names to filter them from props later
  const stateKeys = Object.keys(higherOrderStates);
  const propsToFilter = [
    ...stateKeys.map(stateKey => higherOrderStates[stateKey].updateHandlerName),
    ...stateKeys
  ];

  return ComposedComponent =>
    class WithControllableStateWrapper extends Component {
      getControllableStates = () => {
        const { props } = this;
        return mapObject(
          higherOrderStates,
          (
            {
              initialValue,
              updateHandlerName,
              setterName,
              notifyOnUpdate,
              handlers
            },
            stateKey
          ) => ({
            [stateKey]: {
              value: props[stateKey],
              updateHandler: props[updateHandlerName],
              initialValue: valueFrom(initialValue, props),
              setterName,
              notifyOnUpdate,
              handlers
            }
          })
        );
      };

      getFilteredProps = () => {
        return mapObject(
          this.props,
          (prop, propKey) =>
            ~propsToFilter.indexOf(propKey) && { [propKey]: prop }
        );
      };

      render() {
        return (
          <ControllableState states={this.getControllableStates()}>
            {controllableProps => (
              <ComposedComponent
                {...this.getFilteredProps()}
                {...controllableProps}
              />
            )}
          </ControllableState>
        );
      }
    };
}
