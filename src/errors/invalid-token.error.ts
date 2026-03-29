export class INVALID_TOKEN extends Error {
  constructor(public message: string) {
    super(message)
  }
}
