'use strict';

angular.module('bahmni.clinical')
    .controller('OrderController', ['$scope', 'conceptSetService', 'allOrderables',
        function ($scope, conceptSetService, allOrderables) {
            $scope.consultation.allOrdersTemplates = $scope.consultation.allOrdersTemplates || {};
            $scope.consultation.testOrders = $scope.consultation.testOrders || [];
            $scope.consultation.allOrdersTemplates = allOrderables;

            var init = function(){

                $scope.tabs = [];

                _.forEach($scope.consultation.allOrdersTemplates, function(item){
                    var conceptName = _.find(item.names, {conceptNameType: "SHORT"}) || _.find(item.names, {conceptNameType: "FULLY_SPECIFIED"});
                    conceptName = conceptName ? conceptName.name : conceptName;
                    $scope.tabs.push({name: conceptName ? conceptName : item.name.name, topLevelConcept: item.name.name});
                });

                if($scope.tabs) {
                    $scope.activateTab($scope.tabs[0]);
                }
            };

            $scope.getTabInclude = function(){
                return 'consultation/views/orderTemplateViews/ordersTemplate.html';
            };

            $scope.getConceptClassesInSet = function(conceptSet) {
                var conceptsWithUniqueClass = _.uniq(conceptSet? conceptSet.setMembers:[],function(concept){return concept.conceptClass.uuid;});
                var conceptClasses = [];
                _.forEach(conceptsWithUniqueClass, function(concept){
                    conceptClasses.push({name:concept.conceptClass.name, display:concept.conceptClass.display});
                });
                return conceptClasses;
            };

            $scope.getOrderTemplate = function(templateName) {
                var key = '\''+templateName+'\'';               
                return $scope.consultation.allOrdersTemplates[key];
            };

            $scope.activateTab = function(tab){
                $scope.activeTab && ($scope.activeTab.klass="");
                $scope.activeTab = tab;
                $scope.activeTab.klass="active";
            };

            $scope.showLeftCategoryTests = function(leftCategory) {
                $scope.activeTab.leftCategory && ($scope.activeTab.leftCategory.klass="");
                $scope.activeTab.leftCategory = leftCategory;
                $scope.activeTab.leftCategory.klass = "active";

                $scope.activeTab.leftCategory.groups = $scope.getConceptClassesInSet(leftCategory);
            };

            $scope.diSelect = function(selectedOrder) {
                var order = _.find($scope.consultation.testOrders, function(order) {
                    return order.concept.uuid === selectedOrder.concept.uuid;
                });

                if (order.uuid) {
                    order.voided = !order.voided;
                }
                else {
                    removeOrder(order);
                }
            };

            var removeOrder = function(order){
                _.remove($scope.consultation.testOrders, function(o){
                    return o.concept.uuid == order.concept.uuid;
                });
            };

            init();

        }]);