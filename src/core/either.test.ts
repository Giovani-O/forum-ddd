import { expect, it } from 'vitest'
import { type Either, failure, success } from './either.js'

function doSomeThing(shouldSuccess: boolean): Either<string, number> {
  if (shouldSuccess) {
    return success(10)
  } else {
    return failure('error')
  }
}

it('success result', () => {
  const successResult = doSomeThing(true)

  expect(successResult.isSuccess()).toBe(true)
  expect(successResult.isFailure()).toBe(false)
})

it('failure result', () => {
  const failureResult = doSomeThing(false)

  expect(failureResult.isFailure()).toBe(true)
  expect(failureResult.isSuccess()).toBe(false)
})
