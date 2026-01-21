import { airQualityWithData, airQualityEmpty, airQualityDay } from '../fixtures/airQuality';

describe('Air Quality Page', () => {
  describe('with data', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/airquality/week', airQualityWithData).as('getAirQualityWeek');
      cy.intercept('GET', '**/api/airquality/day', airQualityDay).as('getAirQualityDay');
      cy.intercept('GET', '**/api/airquality/month', airQualityWithData).as('getAirQualityMonth');
      cy.intercept('GET', '**/api/airquality/year', airQualityWithData).as('getAirQualityYear');
      cy.visit('/luftkvalitet');
    });

    it('should render the page with correct heading', () => {
      cy.wait('@getAirQualityWeek');
      cy.get('h1').should('contain.text', 'Luftkvalitet');
    });

    it('should display Graf and Tabell navigation buttons', () => {
      cy.wait('@getAirQualityWeek');
      cy.contains('button', 'Graf').should('be.visible');
      cy.contains('button', 'Tabell').should('be.visible');
    });

    it('should display filter buttons', () => {
      cy.wait('@getAirQualityWeek');
      cy.contains('button', 'År').should('be.visible');
      cy.contains('button', 'Månad').should('be.visible');
      cy.contains('button', 'Vecka').should('be.visible');
      cy.contains('button', 'Dygn').should('be.visible');
    });

    it('should display the chart area', () => {
      cy.wait('@getAirQualityWeek');
      cy.get('.recharts-responsive-container').should('be.visible');
    });

    it('should switch to table view when clicking Tabell', () => {
      cy.wait('@getAirQualityWeek');
      cy.contains('button', 'Tabell').click();
      cy.get('table').should('be.visible');
    });

    it('should switch back to graph view when clicking Graf', () => {
      cy.wait('@getAirQualityWeek');
      cy.contains('button', 'Tabell').click();
      cy.contains('button', 'Graf').click();
      cy.get('.recharts-responsive-container').should('be.visible');
    });

    it('should fetch day data when clicking Dygn filter', () => {
      cy.wait('@getAirQualityWeek');
      cy.contains('button', 'Dygn').click();
      cy.wait('@getAirQualityDay');
      cy.get('h1').should('contain.text', 'dygnet');
    });

    it('should fetch month data when clicking Månad filter', () => {
      cy.wait('@getAirQualityWeek');
      cy.contains('button', 'Månad').click();
      cy.wait('@getAirQualityMonth');
      cy.get('h1').should('contain.text', 'månaden');
    });

    it('should fetch year data when clicking År filter', () => {
      cy.wait('@getAirQualityWeek');
      cy.contains('button', 'År').click();
      cy.wait('@getAirQualityYear');
      cy.get('h1').should('contain.text', 'året');
    });

    it('should display legend items for pollutants', () => {
      cy.wait('@getAirQualityWeek');
      cy.get('.recharts-legend-wrapper').should('be.visible');
    });
  });

  describe('with empty data', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/airquality/week', airQualityEmpty).as('getAirQualityEmpty');
      cy.visit('/luftkvalitet');
    });

    it('should render the page even with no pollutant data', () => {
      cy.wait('@getAirQualityEmpty');
      cy.get('h1').should('contain.text', 'Luftkvalitet');
    });

    it('should display empty chart with grid', () => {
      cy.wait('@getAirQualityEmpty');
      cy.get('.recharts-responsive-container').should('be.visible');
      cy.get('.recharts-cartesian-grid').should('be.visible');
    });

    it('should still allow filter switching', () => {
      cy.wait('@getAirQualityEmpty');
      cy.contains('button', 'År').should('be.visible').and('not.be.disabled');
      cy.contains('button', 'Månad').should('be.visible').and('not.be.disabled');
      cy.contains('button', 'Dygn').should('be.visible').and('not.be.disabled');
    });
  });

  describe('with API error', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/airquality/week', {
        statusCode: 504,
        body: { message: 'Gateway timeout' },
      }).as('getAirQualityTimeout');
      cy.visit('/luftkvalitet');
    });

    it('should display error message on API failure', () => {
      cy.wait('@getAirQualityTimeout');
      cy.contains('Servern svarar inte').should('be.visible');
    });

    it('should still render the page structure', () => {
      cy.wait('@getAirQualityTimeout');
      cy.get('h1').should('contain.text', 'Luftkvalitet');
      cy.contains('button', 'Graf').should('be.visible');
      cy.contains('button', 'Tabell').should('be.visible');
    });
  });

  describe('with connection error', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/airquality/week', {
        statusCode: 502,
        body: { message: 'Bad gateway' },
      }).as('getAirQualityConnectionError');
      cy.visit('/luftkvalitet');
    });

    it('should display connection error message', () => {
      cy.wait('@getAirQualityConnectionError');
      cy.contains('Kunde inte ansluta').should('be.visible');
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/airquality/week', airQualityWithData).as('getAirQualityWeek');
      cy.visit('/luftkvalitet');
    });

    it('should have skip to content link', () => {
      cy.wait('@getAirQualityWeek');
      cy.contains('a', 'Hoppa till innehåll').should('exist');
    });

    it('should have proper heading structure', () => {
      cy.wait('@getAirQualityWeek');
      cy.get('h1').should('have.length', 1);
    });
  });
});
