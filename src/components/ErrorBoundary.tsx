import React from 'react';
import { ErrorOrigin } from '../server/misc';

interface ErrorBoundaryProps {
  origin: ErrorOrigin
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  info: React.ErrorInfo | null;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      info: null
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({
      hasError: true,
      error: error, 
      info: info
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Oops, something went wrong :(</h1>
          <p>The error: {this.state.error?.toString()}</p>
          <p>Where it occured: {this.state.info?.componentStack}</p>
          <p>Where it occured x2: {this.props.origin}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
