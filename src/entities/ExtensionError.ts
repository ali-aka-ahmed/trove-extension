import { v4 as uuid } from 'uuid';
import IExtensionError from '../models/IExtensionError';

export default class ExtensionError implements IExtensionError {
  public id: string;
  public name: string;
  public creationDatetime: number;
  public readableMessage: string;
  public message: string;
  public stack: string;

  constructor(errorMessage: string, readableMessage?: string, stack?: string) {
    this.id = uuid();
    this.name = 'ExtensionError';
    this.creationDatetime = Date.now();    
    this.message = errorMessage;
    this.readableMessage = readableMessage || errorMessage;
    // Maintains proper stack trace for where our error was thrown
    if (stack) this.stack = stack;
    else if (Error.captureStackTrace) Error.captureStackTrace(this, ExtensionError);
  }
}
