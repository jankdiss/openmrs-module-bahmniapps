'use strict';

angular.module('bahmni.common.offline')
    .service('androidDbService', ['$q', 'eventLogService',
        function ($q, eventLogService) {
            var getMarker = function (markerName) {
                var value = AndroidOfflineService.getMarker(markerName);
                value = value != undefined ? JSON.parse(value) : value;
                return $q.when(value);
            };

            var insertMarker = function (markerName, uuid, catchmentNumber) {
                var value = AndroidOfflineService.insertMarker(markerName, uuid, catchmentNumber);
                value = value != undefined ? JSON.parse(value) : value;
                return $q.when(value);

            };

            var createPatient = function (patient) {
                var patientString = JSON.stringify(patient);
                var value = AndroidOfflineService.createPatient(patientString);
                value = value != undefined ? JSON.parse(value) : value;
                return $q.when(value);
            };

            var insertAddressHierarchy = function (addressHierarchy) {
                var addressHierarchyString = JSON.stringify(addressHierarchy);
                var value = AndroidOfflineService.insertAddressHierarchy(addressHierarchyString);
                value = value != undefined ? JSON.parse(value) : value;
                return $q.when(value);
            };

            var init = function () {
                // Hemanth: This method is not required for android app.
            };

            var initSchema = function () {
                return $q.when(AndroidOfflineService.initSchema());
            };

            var deletePatientData = function (identifier) {
                AndroidOfflineService.deletePatientData(identifier);
                return $q.when({});

            };

            var getPatientByUuid = function (uuid) {
                var value = AndroidOfflineService.getPatientByUuid(uuid);
                value = value != undefined ? JSON.parse(value) : value;
                angular.forEach(value.patient.person.attributes, function(attribute){
                    if(attribute.hydratedObject){
                        var temp = attribute.hydratedObject;
                        delete attribute.hydratedObject;
                        attribute.hydratedObject = temp;
                    }
                }); 
                return $q.when(value);
            };

            var searchAddress = function(requestParams){
                var addressParams = JSON.stringify(requestParams);
                var value = AndroidOfflineService.searchAddress(addressParams);
                value = value != undefined ? JSON.parse(value) : value;
                return $q.when({data:value});
            };

            var getConfig = function(module){
                var value = AndroidConfigDbService.getConfig(module);
                value = value != undefined ? JSON.parse(value) : value;
                return $q.when(value);
            };

            var insertConfig = function(module, data, eTag){
                return $q.when(JSON.parse(AndroidConfigDbService.insertConfig(module, JSON.stringify(data), eTag)));
            };

            var getReferenceData = function(referenceDataKey){
                var value = AndroidReferenceDataDbService.getReferenceData(referenceDataKey);
                value = value != undefined ? JSON.parse(value) : value;
                return $q.when(value);
            };

            var insertReferenceData = function(key, data, eTag){
                var referenceData;
                if(key == "LocaleList" || key == "DefaultEncounterType" || key == "NonCodedDrugConcept" || (key == "RelationshipTypeMap" && data=="")) {
                    referenceData = data;
                }
                else {
                    referenceData = JSON.stringify(data);
                }
                AndroidReferenceDataDbService.insertReferenceData(key, referenceData, eTag);
                return $q.when({})
            };

            var getLocationByUuid = function(uuid){
                var value = AndroidLocationDbService.getLocationByUuid(uuid);
                value = value != undefined ? JSON.parse(value).value : value;
                return $q.when(value);
            };

            var getAttributeTypes = function(){
                var value = AndroidOfflineService.getAttributeTypes();
                value = value != undefined ? JSON.parse(value): value;
                return $q.when(value);
            };

            var createEncounter = function (encounterData) {
                var deferred = $q.defer();
                insertEncounterData(encounterData).then(function () {
                    if(encounterData.visitUuid){
                        eventLogService.getDataForUrl(Bahmni.Common.Constants.visitUrl + "/" + encounterData.visitUuid).then(function(response) {
                            insertVisitData(response.data).then(function() {
                                deferred.resolve({data: encounterData});
                            });
                        },function (error) {
                            deferred.resolve({data: encounterData});
                        });
                    }else{
                        deferred.resolve({data: encounterData});
                    }
                });
                return deferred.promise;
            };


            var insertEncounterData = function (encounterData) {
                var encounter = AndroidOfflineService.insertEncounterData(JSON.stringify(encounterData));
                return insertObservationData(encounterData.patientUuid, encounterData.visitUuid, encounterData.observations).then(function () {
                    encounter = encounter != undefined ? JSON.parse(encounter) : encounter;
                    return encounter;
                });
            };

            var getEncountersByPatientUuid = function (patientUuid) {
                var response = AndroidOfflineService.getEncountersByPatientUuid(patientUuid);
                response = response != undefined ? JSON.parse(response) : response;
                return $q.when(response);
            };

            var insertVisitData = function (visitData) {
                var response = AndroidOfflineService.insertVisitData(JSON.stringify(visitData));
                response = response != undefined ? JSON.parse(response) : response;
                return $q.when(response);
            };

            var getVisitByUuid = function (visitUuid) {
                var response = AndroidOfflineService.getVisitByUuid(visitUuid);
                response = response != undefined ? JSON.parse(response) : response;
                return $q.when(response);
            };
            
            var getActiveEncounter = function(params){
                var deferred = $q.defer();
                getReferenceData("encounterSessionDuration").then(function(encounterSessionDurationData){
                    var encounterSessionDuration = encounterSessionDurationData.data;
                    getReferenceData("DefaultEncounterType").then(function(defaultEncounterType) {
                        var encounterType = defaultEncounterType ? defaultEncounterType.data : null;
                        var response = AndroidOfflineService.findActiveEncounter(JSON.stringify({patientUuid: params.patientUuid, providerUuid: params.providerUuids[0], encounterType: encounterType}), encounterSessionDuration);
                        response = response != undefined ? JSON.parse(response) : response;
                        deferred.resolve(response);
                    });
                });
                return deferred.promise;
            };

            var insertObservationData = function (patientUuid, visitUuid, observationData) {
                var response = AndroidOfflineService.insertObservationData(patientUuid, visitUuid, JSON.stringify(observationData));
                response = response != undefined ? JSON.parse(response) : response;
                return $q.when(response);
            };

            var getVisitsByPatientUuid = function (patientUuid, numberOfVisits) {
                var response = AndroidOfflineService.getVisitsByPatientUuid(patientUuid, numberOfVisits);
                response = response != undefined ? JSON.parse(response) : response;
                return $q.when(response);
            };

            var getObservationsFor = function(params) {
                var response =  AndroidOfflineService.getObservationsFor(JSON.stringify(params));
                response = response != undefined ? JSON.parse(response) : response;
                return $q.when(response);
            };

            var insertConceptAndUpdateHierarchy = function(data, parent) {
                if(!parent) {
                    parent = null;
                }
                else{
                    parent = JSON.stringify(parent);
                }
                AndroidConceptDbService.insertConceptAndUpdateHierarchy(JSON.stringify(data), parent);
                return $q.when({})
            };

            var getConcept = function(conceptUuid){
                var value = AndroidConceptDbService.getConcept(conceptUuid);
                value = value != undefined ? JSON.parse(value) : value;
                return $q.when(value);
            };

            var getConceptByName = function(conceptName){
                var value = AndroidConceptDbService.getConceptByName(conceptName);
                value = value != undefined ? JSON.parse(value) : value;
                return $q.when(value);
            };

            var getEncounterByEncounterUuid = function(encounterUuid){
                var response = AndroidOfflineService.findEncounterByEncounterUuid(encounterUuid);
                response = response != undefined ? JSON.parse(response) : response;
                return $q.when(response);
            };

            var getAllParentsInHierarchy = function(conceptName){
                var conceptNamesInHierarchy = [];
                var response = AndroidConceptDbService.getAllParentsInHierarchy(conceptName);
                response = response != undefined ? JSON.parse(response) : response;
                return $q.when(response);
            };

            var insertLog = function (errorLogUuid,failedRequest, responseStatus, stacktrace, requestPayload) {
                var provider = _.has(requestPayload, 'providers') ? requestPayload.providers[0] :
                    ( _.has(requestPayload, 'auditInfo.creator') ? requestPayload.auditInfo.creator : null);
                requestPayload = requestPayload ? requestPayload : null;
                var deferred = $q.defer();
                try {
                    var response = AndroidOfflineService.insertLog(errorLogUuid, failedRequest, responseStatus, JSON.stringify(stacktrace), JSON.stringify(requestPayload), JSON.stringify(provider))
                }catch(error){
                    deferred.reject();
                    return deferred.promise;
                }
               return $q.when(response)
            };

            var getAllLogs = function () {
                var value =  AndroidOfflineService.getAllLogs();
                value = _.isEmpty(value) ? [] : JSON.parse(value);
                return $q.when(value);
            };

            var getErrorLogByUuid = function (uuid) {
                var value =  AndroidOfflineService.getErrorLogByUuid(uuid);
                value = value !== undefined ? JSON.parse(value) : value;
                return $q.when(value);
            };

            var deleteErrorFromErrorLog = function(uuid) {
                AndroidOfflineService.deleteByUuid(uuid);
                return $q.when({})
            };

            var getPrescribedAndActiveDrugOrders = function (params) {
                var response = AndroidOfflineService.getEncountersByVisits(JSON.stringify(params));
                response = response != undefined ? JSON.parse(response) : response;
                return $q.when(response);
            };
            
            return {
                init: init,
                initSchema: initSchema,
                getPatientByUuid: getPatientByUuid,
                createPatient: createPatient,
                deletePatientData: deletePatientData,
                getMarker: getMarker,
                insertMarker: insertMarker,
                insertAddressHierarchy: insertAddressHierarchy,
                searchAddress: searchAddress,
                getConfig: getConfig,
                insertConfig : insertConfig,
                getReferenceData: getReferenceData,
                insertReferenceData: insertReferenceData,
                getLocationByUuid: getLocationByUuid,
                getAttributeTypes: getAttributeTypes,
                insertEncounterData: insertEncounterData,
                getEncountersByPatientUuid: getEncountersByPatientUuid,
                createEncounter: createEncounter,
                insertVisitData: insertVisitData,
                getVisitByUuid: getVisitByUuid,
                getActiveEncounter: getActiveEncounter,
                getVisitsByPatientUuid: getVisitsByPatientUuid,
                getObservationsFor: getObservationsFor,
                insertConceptAndUpdateHierarchy: insertConceptAndUpdateHierarchy,
                getConcept: getConcept,
                getConceptByName: getConceptByName,
                getEncounterByEncounterUuid: getEncounterByEncounterUuid,
                insertLog: insertLog,
                getAllLogs: getAllLogs,
                getAllParentsInHierarchy: getAllParentsInHierarchy,
                getPrescribedAndActiveDrugOrders: getPrescribedAndActiveDrugOrders,
                getErrorLogByUuid: getErrorLogByUuid,
                deleteErrorFromErrorLog: deleteErrorFromErrorLog
            }
        }
    ]);