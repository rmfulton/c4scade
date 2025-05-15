import {noMoreSpace} from "../lib.js";
import { strict as assert } from 'assert';

describe('lib', function () {
  describe('#noMoreSpace()', function () {
    it('should return true when the input is empty', function () {
      assert.equal(noMoreSpace([[]]), true);
    });
  });
});