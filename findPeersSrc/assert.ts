export function assert(condition: boolean, message: string): asserts condition {
  if (condition == false) throw Error(message)
}
