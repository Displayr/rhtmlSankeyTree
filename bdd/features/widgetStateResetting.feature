Feature: State Reset Conditions
  All data changes, and widget resizes, cause state to be reset

  @applitools @state_reset
  Scenario: If the state "plot size" does not match the current plot size, the widget will reset state to base
    Given I am viewing "data.functional_tests.minimal" with state "data.functional_tests.state_minimal.600x600_base" and dimensions 500x500
    And I wait for animations and state callbacks to complete
    Then the "minimal_500x500_base" snapshot matches the baseline
    And the final state callback should match "data.functional_tests.state_minimal.500x500_base" within 1.5

  @applitools @state_reset
  Scenario: If the state "source data" does not match the current source data, the widget will reset state to base
    Given I am viewing "data.functional_tests.minimal" with state "data.functional_tests.state_minimal.500x500_modified_data_50_50_split" and dimensions 500x500
    And I wait for animations and state callbacks to complete
    Then the "minimal_500x500_base" snapshot matches the baseline
    And the final state callback should match "data.functional_tests.state_minimal.500x500_base" within 1.5
