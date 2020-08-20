/*
Add end of trip odometer readings - utility to track trip distances 

Copyright 2020  Herr_Alien <alexandru.garofide@gmail.com>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
                
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.
                
You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see https://www.gnu.org/licenses/agpl.html
*/

"use strict";

(function() {
var Notifications = {
    New: function () {
        var a = {
            _handlers: [],
            add: function (handler) {
                a._handlers.push(handler);
            },
            remove : function (handler) {
                var i = 0;
                for (i = 0; i < a._handlers.length; i++) {
                    if (a._handlers[i] == handler) {
                        a._handlers.splice(i);
                    }
                }
            },
            notify: function () {
                var i = 0;
                for (i = 0; i < a._handlers.length; i++)
                    a._handlers[i].apply(this, arguments);
            }
        };
        return a;
    }
};

var AppLogic = {
    // if anything bad happens, retry this call
    attemptAddingEntry : function (kms, tripType, dateOfTrip) {
        if (!AppSettings.data.apiKey) {
            return AppLogic.getValidSettingsThenAttemptAddingEntry (kms, tripType, dateOfTrip);
        }
    },

    getValidSettingsThenAttemptAddingEntry : function (kms, tripType, dateOfTrip) {
        var func = function() {
            var _km = kms;
            var _type = tripType;
            var _date = dateOfTrip;
            AppLogic.attemptAddingEntry (_km, _type, _date);
            AppSettings.onDataUpdated.remove (func);
        };
        AppSettings.onDataUpdated.add (func);
        gotoUrl("#settings");
    },

    init : function() {
        document.getElementById("submit").onclick = function() {
            AppLogic.attemptAddingEntry (
                document.getElementById("kilometers").value,
                document.getElementById("purpose").checked ? "P" : "F",
                new Date()
            );
        };
    }
};

var AppSettings = {
    data : {
        apiKey : "",
        clientId : "",
        sheetId : "",
        localStorageKey : document.location.href + "/Settings"
    },

    onDataUpdated : Notifications.New(),

    init : function() {
        document.getElementById("submit-settings").onclick = function() {
            AppSettings.data.apiKey = document.getElementById("apikey").value;
            AppSettings.data.clientId = document.getElementById("clientid").value;
            AppSettings.data.sheetId = document.getElementById("spreadsheetid").value;

            // save it in local storage
            localStorage.setItem(AppSettings.data.localStorageKey, JSON.stringify(AppSettings.data));

            AppSettings.onDataUpdated.notify();
        };
        
        try {
            var data = JSON.parse(localStorage.getItem(AppSettings.data.localStorageKey));
            if (data) {
                AppSettings.data = data;
            }
            document.getElementById("apikey").value = AppSettings.data.apiKey;
            document.getElementById("clientid").value = AppSettings.data.clientId;
            document.getElementById("spreadsheetid").value = AppSettings.data.sheetId;
        } catch (err) {}
    }
};

AppLogic.init();
AppSettings.init();

})();

