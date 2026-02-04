import { airQualityWithData, airQualityEmpty, airQualityDay } from '../fixtures/airQuality';

describe('Air Quality Page', () => {
  describe('with data', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/airquality/week*', airQualityWithData).as('getAirQualityWeek');
      cy.intercept('GET', '**/api/airquality/day*', airQualityDay).as('getAirQualityDay');
      cy.intercept('GET', '**/api/airquality/month*', airQualityWithData).as('getAirQualityMonth');
      cy.intercept('GET', '**/api/airquality/year*', airQualityWithData).as('getAirQualityYear');
      cy.intercept('GET', '**/api/airquality/fourdays*', airQualityWithData).as('getAirQualityFourdays');
      cy.visit('/luftkvalitet');
    });

    it('should render the page with correct heading', () => {
      cy.wait('@getAirQualityFourdays');
      cy.get('h1').should('contain.text', 'Luftkvalitet');
    });

    it('should display Linjediagram, Stapeldiagram and Tabell navigation buttons', () => {
      cy.wait('@getAirQualityFourdays');
      cy.contains('button', 'Linjediagram').should('be.visible');
      cy.contains('button', 'Stapeldiagram').should('be.visible');
      cy.contains('button', 'Tabell').should('be.visible');
    });

    it('should display filter buttons', () => {
      cy.wait('@getAirQualityFourdays');
      cy.contains('button', '4 dagar').should('be.visible');
      cy.contains('button', 'Dygn').should('be.visible');
    });

    it('should display station dropdown', () => {
      cy.wait('@getAirQualityFourdays');
      cy.get('[data-testid="station-select"]').should('be.visible');
      cy.get('[data-testid="station-select"]').should('contain.text', 'Köpmangatan');
    });

    it('should display the chart area', () => {
      cy.wait('@getAirQualityFourdays');
      cy.get('.recharts-responsive-container').should('be.visible');
    });

    it('should switch to table view when clicking Tabell', () => {
      cy.wait('@getAirQualityFourdays');
      cy.contains('button', 'Tabell').click();
      cy.get('table').should('be.visible');
    });

    it('should switch back to graph view when clicking Linjediagram', () => {
      cy.wait('@getAirQualityFourdays');
      cy.contains('button', 'Tabell').click();
      cy.contains('button', 'Linjediagram').click();
      cy.get('.recharts-responsive-container').should('be.visible');
    });

    it('should fetch day data when clicking Dygn filter', () => {
      cy.wait('@getAirQualityFourdays');
      cy.contains('button', 'Dygn').click();
      cy.wait('@getAirQualityDay');
      cy.get('h1').should('contain.text', 'dygnet');
    });

    it('should fetch fourdays data when clicking 4 dagar filter', () => {
      cy.wait('@getAirQualityFourdays');
      cy.contains('button', 'Dygn').click();
      cy.wait('@getAirQualityDay');
      cy.contains('button', '4 dagar').click();
      cy.wait('@getAirQualityFourdays');
      cy.get('h1').should('contain.text', '4 dagarna');
    });

    it('should display legend items for pollutants', () => {
      cy.wait('@getAirQualityFourdays');
      cy.get('.recharts-legend-wrapper').should('be.visible');
    });

    it('should switch stations when selecting Bergsgatan', () => {
      cy.wait('@getAirQualityFourdays');
      cy.get('[data-testid="station-select"]').select('1098100');
      cy.wait('@getAirQualityFourdays');
      cy.get('h1').should('contain.text', 'Bergsgatan');
    });

    it('should persist station selection when changing time filter', () => {
      cy.wait('@getAirQualityFourdays');
      cy.get('[data-testid="station-select"]').select('1098100');
      cy.wait('@getAirQualityFourdays');
      cy.contains('button', 'Dygn').click();
      cy.wait('@getAirQualityDay');
      cy.get('h1').should('contain.text', 'Bergsgatan');
      cy.get('[data-testid="station-select"]').should('have.value', '1098100');
    });
  });

  describe('with empty data', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/airquality/fourdays*', airQualityEmpty).as('getAirQualityEmpty');
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
      cy.contains('button', '4 dagar').should('be.visible').and('not.be.disabled');
      cy.contains('button', 'Dygn').should('be.visible').and('not.be.disabled');
    });
  });

  describe('with API error', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/airquality/fourdays*', {
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
      cy.contains('button', 'Linjediagram').should('be.visible');
      cy.contains('button', 'Stapeldiagram').should('be.visible');
      cy.contains('button', 'Tabell').should('be.visible');
    });
  });

  describe('with connection error', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/airquality/fourdays*', {
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
      cy.intercept('GET', '**/api/airquality/fourdays*', airQualityWithData).as('getAirQualityFourdays');
      cy.visit('/luftkvalitet');
    });

    it('should have skip to content link', () => {
      cy.wait('@getAirQualityFourdays');
      cy.contains('a', 'Hoppa till innehåll').should('exist');
    });

    it('should have proper heading structure', () => {
      cy.wait('@getAirQualityFourdays');
      cy.get('h1').should('have.length', 1);
    });
  });
});
