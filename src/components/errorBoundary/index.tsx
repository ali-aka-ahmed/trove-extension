import React from 'react';
import IExtensionError from '../../models/IExtensionError';
import { createErrorReport, ErrorOrigin, ErrorReqBody } from '../../server/misc';
import { get1 } from '../../utils/chrome/storage';

interface ErrorBoundaryProps {
  origin: ErrorOrigin
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

/**
 * Global handler for all errors. When reporting an error, throw an ExtensionError like so:
 * Note: You only need the stack argument if you are passed an error object
 * 
 * throw new ExtensionError(error.message, 'Error creating highlight, try again!', err.stack)
 */
export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false,
      message: ""
    };
  }

  async componentDidCatch(error: IExtensionError, info: React.ErrorInfo) {
    console.error(error.message)
    this.setState({ 
      hasError: true,
      message: error.readableMessage || error.message
    });
    const args: ErrorReqBody = {
      origin: this.props.origin,
      message: error.message,
      error,
      componentStack: info.componentStack
    };
    const user = await get1('user');
    if (user?.id) args.userId = user.id;
    if (window.location.href) args.url = window.location.href;
    const res = await createErrorReport(args);
    if (res.success) console.info('Error report sent!');
  }

  render() {
    const { hasError, message } = this.state;
    if (hasError) { 
      return <div/>;
      // return ( 
      //   <div className="TroveErrorBoundary__Alert">
      //     <Alert type="error" message={message} />
      //   </div>
      // );
    }

    return this.props.children;
  }
}
