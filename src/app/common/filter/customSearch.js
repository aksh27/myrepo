(function(){
  'use strict';

  angular
    .module('support')
    .filter('customSearch', customSearch);

  /** @ngInject */
  function customSearch($filter, $rootScope){
    return function(array, obj){
      $rootScope.filterSearch = true;
      var obj1 = [], obj2 = [], obj3 = [], obj4 = [], obj5 = [], filterObj = [];
      if(!angular.isUndefined(obj.key) && obj.key != ""){
        if(obj.module == "t"){
          obj1 = $filter("filter")(array, {label:obj.key});
          obj2 = $filter("filter")(array, {to:obj.key});
          obj3 = $filter("filter")(array, {tid:obj.key});
          obj4 = $filter("filter")(array, {sub:obj.key});
        } else if(obj.module == "a"){
          obj1 = $filter("filter")(array, {label:obj.key});
          obj2 = $filter("filter")(array, {type:obj.key});
        } else if(obj.module == "kb"){
          obj1 = $filter("filter")(array, {label:obj.key});
        }
        else if(obj.module == "s"){
          obj1 = $filter("filter")(array, {label:obj.key});
          obj2 = $filter("filter")(array, {email:obj.key});
        }
        else if(obj.module == "ul"){
          obj1 = $filter("filter")(array, {data:obj.key});
          obj2 = $filter("filter")(array, {user:obj.key});
        }
        else if(obj.module == "od"){
          obj1 = $filter("filter")(array, {name:obj.key});
          obj2 = $filter("filter")(array, {tempId:obj.key});
        }
        else if(obj.module == "i"){
          obj1 = $filter("filter")(array, {sn:obj.key});
          obj2 = $filter("filter")(array, {type:{label:obj.key}});
          obj3 = $filter("filter")(array, {model:{label:obj.key}});
          obj4 = $filter("filter")(array, {label:obj.key});
          obj5 = $filter("filter")(array, {typeLabel:obj.key});
        }
        else if(obj.module == "ts"){
          obj1 = $filter("filter")(array, {uName:obj.key});
          // obj2 = $filter("filter")(array, {user:obj.key});
        }
        else if(obj.module == "su"){
          obj1 = $filter("filter")(array, {title:obj.key});
          // obj2 = $filter("filter")(array, {user:obj.key});
        }
        else if(obj.module == "v"){
          obj1 = $filter("filter")(array, {label:obj.key});
        }

        if(
          ((obj1 && obj1.length > 0) && (obj2 && obj2.length > 0)) ||
          ((obj1 && obj1.length > 0) && (obj3 && obj3.length > 0)) ||
          ((obj1 && obj1.length > 0) && (obj4 && obj4.length > 0)) ||
          ((obj2 && obj2.length > 0) && (obj3 && obj3.length > 0)) ||
          ((obj2 && obj2.length > 0) && (obj4 && obj4.length > 0)) ||
          ((obj3 && obj3.length > 0) && (obj4 && obj4.length > 0))
        ){
          var concatObj = obj1.concat(obj2);
          var filteredObj = [], keys = [];
            angular.forEach(concatObj, function(item){
              if(obj.module == "dl" || obj.module == "dls"){
                if(keys.indexOf(item.mac) === -1){
                  keys.push(item.mac);
                  filteredObj.push(item);
                }
              } else{
                if(keys.indexOf(item.id) === -1){
                  keys.push(item.id);
                  filteredObj.push(item);
                }
              }
            });
          return filteredObj;
        } else if(obj1 && obj1.length > 0){
          return obj1;
        } else if(obj2 && obj2.length > 0){
          return obj2;
        } else if(obj3 && obj3.length > 0){
          return obj3;
        } else if(obj4 && obj4.length > 0){
          return obj4;
        } else if(obj5 && obj5.length > 0){
          return obj5;
        } else{
          return [];
        }
      } else{
        return array;
      }
    }
  }
})();
