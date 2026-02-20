/**
 * CMOD Search component
 *
 * Dynamically generates a search form based on folder field definitions
 * and field information config. Executes search against Alfresco and
 * displays results in a data table.
 *
 * @namespace Alfresco.component
 * @class Alfresco.component.CmodSearch
 */
(function()
{
   var Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event,
      CMOD = Alfresco.component.CmodCommon;

   Alfresco.component.CmodSearch = function(htmlId)
   {
      Alfresco.component.CmodSearch.superclass.constructor.call(this, "Alfresco.component.CmodSearch", htmlId);

      this.configFolderNodeId = null;
      this.folders = [];
      this.selectedFolderId = null;
      this.folderConfig = null;
      this.searchFields = [];
      this.hitListFields = [];

      return this;
   };

   YAHOO.extend(Alfresco.component.CmodSearch, Alfresco.component.Base,
   {
      onReady: function()
      {
         var me = this;

         Event.on(this.id + "-folder-select", "change", this.onFolderChange, this, true);
         Event.on(this.id + "-search-btn", "click", this.onSearch, this, true);
         Event.on(this.id + "-clear-btn", "click", this.onClear, this, true);

         CMOD.ensureConfigFolder(function(nodeId)
         {
            me.configFolderNodeId = nodeId;
            if (nodeId) me._loadFolders();
         }, this);
      },

      _loadFolders: function()
      {
         var me = this;
         CMOD.loadFolderRegistry(this.configFolderNodeId, function(folders)
         {
            me.folders = folders;
            CMOD.populateFolderSelector(Dom.get(me.id + "-folder-select"), folders, me.selectedFolderId);
         }, this);
      },

      onFolderChange: function()
      {
         this.selectedFolderId = Dom.get(this.id + "-folder-select").value;
         Dom.get(this.id + "-results-panel").style.display = "none";

         if (this.selectedFolderId)
         {
            this._loadFolderConfig();
         }
         else
         {
            Dom.get(this.id + "-search-form").style.display = "none";
            Dom.get(this.id + "-empty-message").style.display = "block";
         }
      },

      _loadFolderConfig: function()
      {
         var me = this;
         CMOD.loadFolderConfig(this.configFolderNodeId, this.selectedFolderId, function(config)
         {
            me.folderConfig = config;
            me._buildSearchForm();
         }, this);
      },

      _buildSearchForm: function()
      {
         var container = Dom.get(this.id + "-search-fields");
         container.innerHTML = "";

         var fields = this.folderConfig.fieldDefinitions || [];
         var fieldInfo = this.folderConfig.fieldInformation || {};

         // Build search fields sorted by queryOrder
         this.searchFields = [];
         this.hitListFields = [];

         for (var i = 0; i < fields.length; i++)
         {
            var f = fields[i];
            var info = fieldInfo[f.id] || {};
            this.searchFields.push({
               field: f,
               info: info,
               queryOrder: info.queryOrder || 999
            });
            if (info.hitListDisplay !== false)
            {
               this.hitListFields.push({
                  field: f,
                  info: info,
                  sortOrder: info.sortOrder || 999
               });
            }
         }

         this.searchFields.sort(function(a, b) { return a.queryOrder - b.queryOrder; });
         this.hitListFields.sort(function(a, b) { return a.sortOrder - b.sortOrder; });

         if (this.searchFields.length === 0)
         {
            container.innerHTML = '<div class="empty-message">No fields defined for this folder</div>';
            Dom.get(this.id + "-search-form").style.display = "block";
            Dom.get(this.id + "-empty-message").style.display = "none";
            return;
         }

         // Generate search form rows
         for (var j = 0; j < this.searchFields.length; j++)
         {
            var sf = this.searchFields[j];
            var f = sf.field;
            var info = sf.info;
            var operators = info.operators || ["Equal"];

            var rowDiv = document.createElement("div");
            rowDiv.className = "search-field-row";
            rowDiv.setAttribute("data-field-id", f.id);

            // Label
            var label = document.createElement("label");
            label.textContent = f.name + (info.required ? " *" : "");
            rowDiv.appendChild(label);

            // Operator dropdown
            var opSelect = document.createElement("select");
            opSelect.className = "operator-select";
            opSelect.setAttribute("data-role", "operator");
            for (var k = 0; k < operators.length; k++)
            {
               var opt = document.createElement("option");
               opt.value = operators[k];
               opt.textContent = operators[k];
               opSelect.appendChild(opt);
            }
            rowDiv.appendChild(opSelect);

            // Value input(s)
            var inputType = this._getInputType(f.fieldType);
            var input1 = document.createElement("input");
            input1.type = inputType;
            input1.className = "search-input";
            input1.setAttribute("data-role", "value1");
            if (info.fixed)
            {
               input1.readOnly = true;
            }
            rowDiv.appendChild(input1);

            // Between separator and second input
            var sep = document.createElement("span");
            sep.className = "between-separator";
            sep.textContent = " and ";
            sep.style.display = "none";
            sep.setAttribute("data-role", "separator");
            rowDiv.appendChild(sep);

            var input2 = document.createElement("input");
            input2.type = inputType;
            input2.className = "search-input-between";
            input2.style.display = "none";
            input2.setAttribute("data-role", "value2");
            rowDiv.appendChild(input2);

            container.appendChild(rowDiv);

            // Show/hide between fields on operator change
            Event.on(opSelect, "change", function(e)
            {
               var select = e.target || e.currentTarget;
               var row = select.parentNode;
               var isBetween = select.value === "Between" || select.value === "Not Between";
               var sepEl = row.querySelector('[data-role="separator"]');
               var val2El = row.querySelector('[data-role="value2"]');
               if (sepEl) sepEl.style.display = isBetween ? "inline" : "none";
               if (val2El) val2El.style.display = isBetween ? "inline-block" : "none";
            });
         }

         Dom.get(this.id + "-search-form").style.display = "block";
         Dom.get(this.id + "-empty-message").style.display = "none";
      },

      _getInputType: function(fieldType)
      {
         switch (fieldType)
         {
            case "Integer":
            case "Decimal":
               return "number";
            case "Date":
               return "date";
            case "DateTime":
               return "datetime-local";
            default:
               return "text";
         }
      },

      onSearch: function()
      {
         var container = Dom.get(this.id + "-search-fields");
         var rows = container.getElementsByClassName("search-field-row");
         var fieldMapping = this.folderConfig.fieldMapping || {};
         var terms = [];

         for (var i = 0; i < rows.length; i++)
         {
            var row = rows[i];
            var fieldId = row.getAttribute("data-field-id");
            var operator = row.querySelector('[data-role="operator"]').value;
            var value1 = row.querySelector('[data-role="value1"]').value.trim();
            var value2 = row.querySelector('[data-role="value2"]').value.trim();
            var mapping = fieldMapping[fieldId] || {};

            if (!value1 || !mapping.dbFieldName) continue;

            var propName = mapping.dbFieldName;
            var term = this._buildSearchTerm(propName, operator, value1, value2);
            if (term) terms.push(term);
         }

         if (terms.length === 0)
         {
            Alfresco.util.PopupManager.displayMessage({ text: "Please enter at least one search value" });
            return;
         }

         // Get selected logic (AND/OR)
         var logicRadios = document.getElementsByName(this.id + "-logic");
         var logic = "AND";
         for (var r = 0; r < logicRadios.length; r++)
         {
            if (logicRadios[r].checked) { logic = logicRadios[r].value; break; }
         }

         this._executeSearch(terms.join(" " + logic + " "));
      },

      _buildSearchTerm: function(propName, operator, value1, value2)
      {
         // Escape single quotes in values
         var v1 = value1.replace(/'/g, "\\'");
         var v2 = value2.replace(/'/g, "\\'");

         switch (operator)
         {
            case "Equal":
               return propName + ":\"" + v1 + "\"";
            case "Not Equal":
               return "NOT " + propName + ":\"" + v1 + "\"";
            case "Less Than":
               return propName + ":[MIN TO \"" + v1 + "\"}";
            case "Less Than or Equal":
               return propName + ":[MIN TO \"" + v1 + "\"]";
            case "Greater Than":
               return propName + ":{\"" + v1 + "\" TO MAX]";
            case "Greater Than or Equal":
               return propName + ":[\"" + v1 + "\" TO MAX]";
            case "Like":
               return propName + ":\"" + v1 + "*\"";
            case "Not Like":
               return "NOT " + propName + ":\"" + v1 + "*\"";
            case "Between":
               return propName + ":[\"" + v1 + "\" TO \"" + v2 + "\"]";
            case "Not Between":
               return "NOT " + propName + ":[\"" + v1 + "\" TO \"" + v2 + "\"]";
            case "In":
               var vals = v1.split(",");
               var parts = [];
               for (var i = 0; i < vals.length; i++) parts.push(propName + ":\"" + vals[i].trim() + "\"");
               return "(" + parts.join(" OR ") + ")";
            case "Not In":
               var vals2 = v1.split(",");
               var parts2 = [];
               for (var j = 0; j < vals2.length; j++) parts2.push(propName + ":\"" + vals2[j].trim() + "\"");
               return "NOT (" + parts2.join(" OR ") + ")";
            default:
               return propName + ":\"" + v1 + "\"";
         }
      },

      _executeSearch: function(query)
      {
         var me = this;
         var searchUrl = Alfresco.constants.URL_SERVICECONTEXT + "components/cmod/search-proxy";

         Alfresco.util.Ajax.request({
            method: "POST",
            url: searchUrl,
            dataObj: {
               query: {
                  query: query,
                  language: "afts"
               },
               include: ["properties"],
               paging: {
                  maxItems: 100,
                  skipCount: 0
               }
            },
            requestContentType: Alfresco.util.Ajax.JSON,
            responseContentType: Alfresco.util.Ajax.JSON,
            successCallback: {
               fn: function(res)
               {
                  var data = res.json;
                  if (data && data.error)
                  {
                     Alfresco.util.PopupManager.displayMessage({ text: "Search error: " + data.error });
                     if (window.console) console.log("CMOD Search error detail:", JSON.stringify(data));
                  }
                  else
                  {
                     me._renderResults(data);
                  }
               },
               scope: this
            },
            failureCallback: {
               fn: function(res)
               {
                  Alfresco.util.PopupManager.displayMessage({ text: "Search request failed: " + (res.serverResponse ? res.serverResponse.statusText : "Unknown error") });
               },
               scope: this
            }
         });
      },

      _renderResults: function(data)
      {
         var entries = (data.list && data.list.entries) || [];
         var resultsPanel = Dom.get(this.id + "-results-panel");
         var thead = Dom.get(this.id + "-results-thead").getElementsByTagName("tr")[0];
         var tbody = Dom.get(this.id + "-results-tbody");
         var countEl = Dom.get(this.id + "-results-count");

         countEl.textContent = entries.length + " result(s) found";

         // Build header
         var headerHtml = "<th>Name</th>";
         for (var i = 0; i < this.hitListFields.length; i++)
         {
            headerHtml += "<th>" + Alfresco.util.encodeHTML(this.hitListFields[i].field.name) + "</th>";
         }
         thead.innerHTML = headerHtml;

         // Build rows
         if (entries.length === 0)
         {
            var colSpan = this.hitListFields.length + 1;
            tbody.innerHTML = '<tr><td colspan="' + colSpan + '" class="empty-message">No results found</td></tr>';
         }
         else
         {
            var fieldMapping = this.folderConfig.fieldMapping || {};
            var html = "";
            for (var j = 0; j < entries.length; j++)
            {
               var entry = entries[j].entry;
               var nodeRef = entry.id;
               html += '<tr class="clickable" data-node-id="' + nodeRef + '">';
               html += '<td>' + Alfresco.util.encodeHTML(entry.name || '') + '</td>';

               for (var k = 0; k < this.hitListFields.length; k++)
               {
                  var fieldId = this.hitListFields[k].field.id;
                  var mapping = fieldMapping[fieldId] || {};
                  var propName = mapping.dbFieldName || '';
                  var value = '';

                  // Try to get value from properties
                  if (entry.properties && propName)
                  {
                     // Remove namespace prefix for property lookup
                     var shortProp = propName.indexOf(":") > -1 ? propName : propName;
                     value = entry.properties[shortProp] || '';
                  }
                  html += '<td>' + Alfresco.util.encodeHTML(String(value)) + '</td>';
               }
               html += '</tr>';
            }
            tbody.innerHTML = html;

            // Bind row clicks to navigate to document details
            var clickRows = tbody.getElementsByTagName("tr");
            for (var m = 0; m < clickRows.length; m++)
            {
               Event.on(clickRows[m], "click", this._onResultRowClick, this, true);
            }
         }

         resultsPanel.style.display = "block";
      },

      _onResultRowClick: function(e)
      {
         var row = e.currentTarget || e.target;
         while (row && row.tagName !== "TR") row = row.parentNode;
         if (row)
         {
            var nodeId = row.getAttribute("data-node-id");
            if (nodeId)
            {
               window.location.href = Alfresco.constants.URL_PAGECONTEXT + "document-details?nodeRef=workspace://SpacesStore/" + nodeId;
            }
         }
      },

      onClear: function()
      {
         var container = Dom.get(this.id + "-search-fields");
         var inputs = container.getElementsByTagName("input");
         for (var i = 0; i < inputs.length; i++)
         {
            inputs[i].value = "";
         }
         Dom.get(this.id + "-results-panel").style.display = "none";
      }
   });
})();
