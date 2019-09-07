@applitools @rerender
Feature: Multiple Calls to Render Value
  Multiple calls to renderValue should leave the widget in a good state. Updates to the config should be rendered, and there should not be multiple widgets created or remnants of the original config left over.

#  TODO change data to use functional_test directory
  Scenario: Rerender Test
    Given I am viewing "data.functional_tests.minimal_example" with dimensions 500x500 and rerender controls
    Then the "minimal_example_500x500_base" snapshot matches the baseline
    When I rerender with config "data.functional_tests.minimal_example_split_50_50"
    And I wait for animations and state callbacks to complete
    Then the "minimal_example_split_50_50" snapshot matches the baseline
    And the final state callback should match "data.functional_tests.state_minimal_example.500x500_modified_data_50_50_split" within 0.5