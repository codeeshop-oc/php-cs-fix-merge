import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {expect, test} from '@jest/globals'
import INPUTS from '../src/inputs'

test('test runs', () => {
  expect(INPUTS.username == 'username').toBe(true)
})
