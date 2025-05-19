describe('template spec', () => {
  it('passes', () => {
    cy.visit('http://localhost:4200/')
    cy.get('.button-group > :nth-child(1)').click()
    cy.wait(1000)
    cy.get('#email').type('qwer@yahoo.com')
    cy.get('#password').type('qwer')
    cy.get('button').click()
  })
})