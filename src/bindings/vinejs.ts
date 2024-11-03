/*
 * @adonisjs/lucid
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import vine, { VineNumber, VineString } from '@vinejs/vine'
import type { Database } from '../database/main.js'
import type { ContainerBindings } from '@adonisjs/core/types'
import type { Container } from '@adonisjs/core/container'

/**
 * Defines the "unique" and "exists" validation rules with
 * VineJS.
 */
export function defineValidationRules(db: Database, container: Container<ContainerBindings>) {
  const uniqueRule = vine.createRule<Parameters<VineString['unique'] | VineNumber['unique']>[0]>(
    async (value, checker, field) => {
      if (!field.isValid) {
        return
      }

      const isUnique = await checker(db, value as string, field, container)
      if (!isUnique) {
        field.report('The {{ field }} has already been taken', 'database.unique', field)
      }
    }
  )

  const existsRule = vine.createRule<Parameters<VineString['exists'] | VineNumber['exists']>[0]>(
    async (value, checker, field) => {
      if (!field.isValid) {
        return
      }

      const exists = await checker(db, value as string, field, container)
      if (!exists) {
        field.report('The selected {{ field }} is invalid', 'database.exists', field)
      }
    }
  )

  VineString.macro('unique', function (this: VineString, checker) {
    return this.use(uniqueRule(checker))
  })
  VineString.macro('exists', function (this: VineString, checker) {
    return this.use(existsRule(checker))
  })
  VineNumber.macro('unique', function (this: VineNumber, checker) {
    return this.use(uniqueRule(checker))
  })
  VineNumber.macro('exists', function (this: VineNumber, checker) {
    return this.use(existsRule(checker))
  })
}
