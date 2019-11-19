@applitools @resize
Feature: Calls to Resize
  Resize functions correctly.

  Resize causes state to be reset

  Size is stored in the state object

  Scenario: Basic Resizing Test
    Given I am viewing "data.functional_tests.minimal" with dimensions 500x500
    Then the "minimal_500x500_base" snapshot matches the baseline

    When I resize the widget to 600x600
    And I wait for animations and state callbacks to complete
    Then the "minimal_600x600_base" snapshot matches the baseline
    And the final state callback should match "data.functional_tests.state_minimal.600x600_base" within 1.5

    When I resize the widget to 600x300
    And I wait for animations and state callbacks to complete
    Then the "minimal_600x300_base" snapshot matches the baseline

    When I resize the widget to 300x600
    And I wait for animations and state callbacks to complete
    Then the "minimal_300x600_base" snapshot matches the baseline