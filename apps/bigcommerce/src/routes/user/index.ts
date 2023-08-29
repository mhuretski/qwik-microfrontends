import { type RequestHandler } from '@builder.io/qwik-city'
import { faker } from '@faker-js/faker'

export const onGet: RequestHandler = async ({ json }) => {
  // TODO define response model
  json(200, {
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
  })
}
