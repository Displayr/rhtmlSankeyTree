Feature: State Interactions
  The user can click nodes, move the tree, and zoom in on the tree.

  Each interaction should cause a state callback, and when I rerender with that new state value, I should see the same interactions applied to the widget.

  @applitools @state @initialisation
  Scenario: A New widget correctly generates and saves state
    Given I am viewing "data.functional_tests.minimal" with dimensions 500x500
    And I wait for animations and state callbacks to complete
    Then the "minimal_500x500_base" snapshot matches the baseline
    And the final state callback should match "data.functional_tests.state_minimal.500x500_base" within 0.5
    Given I am viewing "data.functional_tests.minimal" with state "data.functional_tests.state_minimal.500x500_base" and dimensions 500x500
    Then the "minimal_500x500_base" snapshot matches the baseline

  @applitools @state @click
  Scenario: A node can be clicked
    Given I am viewing "data.functional_tests.minimal" with dimensions 500x500
    When I click node rectangle 2
    And I wait for animations and state callbacks to complete
    Then the "minimal_500x500_collapsed_2" snapshot matches the baseline
    And the final state callback should match "data.functional_tests.state_minimal.500x500_collapse_2_test" within 0.5
    Given I am viewing "data.functional_tests.minimal" with state "data.functional_tests.state_minimal.500x500_collapse_2_test" and dimensions 500x500
    Then the "minimal_500x500_collapsed_2" snapshot matches the baseline

  @applitools @state @move
  Scenario: The view can be moved
    Given I am viewing "data.functional_tests.minimal" with dimensions 500x500
    When I drag the view by 50 x 50
    And I wait for animations and state callbacks to complete
    Then the "minimal_500x500_moved_50x50" snapshot matches the baseline
    Then the final state callback should match "data.functional_tests.state_minimal.500x500_moved_50x50_test" within 0.5
    Given I am viewing "data.functional_tests.minimal" with state "data.functional_tests.state_minimal.500x500_moved_50x50_test" and dimensions 500x500
    Then the "minimal_500x500_moved_50x50" snapshot matches the baseline

# TODO test zoom. I dont know how to simulate zoom yet