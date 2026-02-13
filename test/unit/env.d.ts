import type { Mock } from 'vitest'

declare global {
  // eslint-disable-next-line vars-on-top
  var readBody: Mock
  // eslint-disable-next-line vars-on-top
  var getQuery: Mock
  // eslint-disable-next-line vars-on-top
  var getRouterParam: Mock
  // eslint-disable-next-line vars-on-top
  var createError: (opts: { statusCode: number, message: string }) => Error & { statusCode: number }
  // eslint-disable-next-line vars-on-top
  var defineEventHandler: <T>(handler: T) => T
}

export {}
