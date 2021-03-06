/**
 elements
 Component that handles the periodic table tab.
 It includes the logic to purchase and display elements.

 @namespace Components
 */
'use strict';

angular.module('game').component('elements', {
  templateUrl: 'views/elements.html',
  controller: ['$timeout', 'state', 'data', 'util', elements],
  controllerAs: 'ct'
});

function elements($timeout, state, data, util) {
  let ct = this;
  ct.state = state;
  ct.data = data;
  ct.util = util;
  ct.outcome = {};
  ct.keys = Object.keys;
  ct.buyAmount = [1, 10, 25, 100, 1000];

  ct.getChance = function(element, player) {
    let bonus = 1;
    for(let resource of data.elements[element].includes){
      let allTime = player.statistics.all_time[resource];
      if(allTime) bonus *= allTime*data.constants.ELEMENT_CHANCE_BONUS+1;
    }

    let singleChance = data.elements[element].abundance*bonus;
    let chance = 1 - Math.pow(Math.max(0, 1-singleChance),
                              Math.min(player.resources.dark_matter.number, ct.buyAmount[player.options.elementBuyIndex]));

    return Math.min(1, chance);
  };

  ct.buyElement = function (element, player) {
    if (player.elements[element]) {
      return;
    }
    if(Math.random() < ct.getChance(element, player)){
      player.elements[element] = true;
      player.exotic_upgrades[element] = {};
      for(let up in data.exotic_upgrades){
        player.exotic_upgrades[element][up] = false;
      }
      player.elements_unlocked++;
      ct.outcome[element] = 'Success';
    }else{
      ct.outcome[element] = 'Fail';
    }
    player.resources.dark_matter.number -= Math.min(player.resources.dark_matter.number, ct.buyAmount[player.options.elementBuyIndex]);

    util.delayedExec(performance.now(),performance.now(), 1000, () => ct.clearMessage(element));
  };

  ct.clearMessage = function (element) {
    ct.outcome[element] = '';
  };

  /* This function returns the class that determines on which
  colour an element card */
  ct.elementClass = function (element, player) {
    if (player.elements[element]) {
      return 'element_purchased';
    }
    if (isElementAvailable(element, player)) {
      return 'element_available';
    }
    return 'element_unavailable';
  };

  function isElementAvailable(element, player) {
    for(let resource of data.elements[element].includes){
      if(player.resources[resource].unlocked){
        return true;
      }
    }
    return false;
  }

  /* This function returns the class that determines the secondary
  colour of an element card */
  ct.elementSecondaryClass = function (element, player) {
    return ct.elementClass(element, player) + '_dark';
  };
}
