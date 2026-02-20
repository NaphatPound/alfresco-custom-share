/**
 * CMOD Field Mapping component
 *
 * Maps each field definition to an Alfresco property (database field name)
 * and application group.
 *
 * @namespace Alfresco.component
 * @class Alfresco.component.CmodFieldMapping
 */
(function()
{
   var Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event,
      CMOD = Alfresco.component.CmodCommon;

   /**
    * Common Alfresco properties available for mapping
    */
   var ALFRESCO_PROPERTIES = [
      { value: "", label: "-- Select Property --" },
      { value: "cm:name", label: "cm:name (File Name)" },
      { value: "cm:title", label: "cm:title (Title)" },
      { value: "cm:description", label: "cm:description (Description)" },
      { value: "cm:author", label: "cm:author (Author)" },
      { value: "cm:created", label: "cm:created (Created Date)" },
      { value: "cm:modified", label: "cm:modified (Modified Date)" },
      { value: "cm:creator", label: "cm:creator (Creator)" },
      { value: "cm:modifier", label: "cm:modifier (Modifier)" },
      { value: "cm:content.size", label: "cm:content.size (File Size)" },
      { value: "cm:content.mimetype", label: "cm:content.mimetype (MIME Type)" },
      { value: "cm:taggable", label: "cm:taggable (Tags)" },
      { value: "cm:categories", label: "cm:categories (Categories)" }
   ];

   Alfresco.component.CmodFieldMapping = function(htmlId)
   {
      Alfresco.component.CmodFieldMapping.superclass.constructor.call(this, "Alfresco.component.CmodFieldMapping", htmlId);

      this.configFolderNodeId = null;
      this.folders = [];
      this.selectedFolderId = null;
      this.folderConfig = null;

      return this;
   };

   YAHOO.extend(Alfresco.component.CmodFieldMapping, Alfresco.component.Base,
   {
      onReady: function()
      {
         var me = this;

         Event.on(this.id + "-folder-select", "change", this.onFolderChange, this, true);
         Event.on(this.id + "-save-mappings-btn", "click", this.onSaveMappings, this, true);

         CMOD.ensureConfigFolder(function(nodeId)
         {
            me.configFolderNodeId = nodeId;
            if (nodeId)
            {
               me._loadFolders();
            }
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
         var sel = Dom.get(this.id + "-folder-select");
         this.selectedFolderId = sel.value;
         if (this.selectedFolderId)
         {
            this._loadFolderConfig();
         }
         else
         {
            this._renderEmptyTable();
            Dom.get(this.id + "-save-mappings-btn").style.display = "none";
         }
      },

      _loadFolderConfig: function()
      {
         var me = this;
         CMOD.loadFolderConfig(this.configFolderNodeId, this.selectedFolderId, function(config)
         {
            me.folderConfig = config;
            me._renderMappingTable();
         }, this);
      },

      _buildPropertySelect: function(fieldId, selectedValue)
      {
         var html = '<select class="mapping-select" data-field-id="' + fieldId + '" data-prop="dbFieldName">';
         var found = false;
         for (var i = 0; i < ALFRESCO_PROPERTIES.length; i++)
         {
            var p = ALFRESCO_PROPERTIES[i];
            var selected = "";
            if (p.value === selectedValue)
            {
               selected = ' selected="selected"';
               found = true;
            }
            html += '<option value="' + Alfresco.util.encodeHTML(p.value) + '"' + selected + '>' +
                     Alfresco.util.encodeHTML(p.label) + '</option>';
         }
         // If the current value is a custom property not in the list, add it
         if (selectedValue && !found)
         {
            html += '<option value="' + Alfresco.util.encodeHTML(selectedValue) + '" selected="selected">' +
                     Alfresco.util.encodeHTML(selectedValue) + ' (custom)</option>';
         }
         html += '</select>';
         return html;
      },

      _renderMappingTable: function()
      {
         var tbody = Dom.get(this.id + "-mapping-table-body");
         var fields = this.folderConfig.fieldDefinitions || [];
         var mappings = this.folderConfig.fieldMapping || {};

         if (fields.length === 0)
         {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-message">' +
               'No fields defined for this folder.<br>' +
               '<a href="' + Alfresco.constants.URL_PAGECONTEXT + 'cmod-field-definition" style="color:#0C79BF;">Go to Field Definition</a> to add fields first.' +
               '</td></tr>';
            Dom.get(this.id + "-save-mappings-btn").style.display = "none";
            return;
         }

         var html = "";
         for (var i = 0; i < fields.length; i++)
         {
            var f = fields[i];
            var mapping = mappings[f.id] || {};
            html += '<tr>' +
               '<td>' + Alfresco.util.encodeHTML(f.name) + '<br><span style="color:#888;font-size:11px;">' + Alfresco.util.encodeHTML(f.fieldType || '') + '</span></td>' +
               '<td>' + this._buildPropertySelect(f.id, mapping.dbFieldName || '') + '</td>' +
               '<td><input type="text" class="mapping-input" data-field-id="' + f.id + '" data-prop="applicationGroup" value="' + Alfresco.util.encodeHTML(mapping.applicationGroup || '') + '" placeholder="e.g. Invoice, Statement" /></td>' +
               '<td><button class="cmod-btn" onclick="return false;">Clear</button></td>' +
               '</tr>';
         }
         tbody.innerHTML = html;
         Dom.get(this.id + "-save-mappings-btn").style.display = "inline-block";

         // Bind clear buttons
         var buttons = tbody.getElementsByTagName("button");
         for (var j = 0; j < buttons.length; j++)
         {
            Event.on(buttons[j], "click", this._onClearRow, this, true);
         }
      },

      _renderEmptyTable: function()
      {
         Dom.get(this.id + "-mapping-table-body").innerHTML =
            '<tr><td colspan="4" class="empty-message">Select a folder to view field mappings</td></tr>';
      },

      _onClearRow: function(e)
      {
         var btn = e.target || e.currentTarget;
         var row = btn.parentNode.parentNode;
         var inputs = row.getElementsByTagName("input");
         var selects = row.getElementsByTagName("select");
         for (var i = 0; i < inputs.length; i++)
         {
            inputs[i].value = "";
         }
         for (var j = 0; j < selects.length; j++)
         {
            selects[j].selectedIndex = 0;
         }
      },

      onSaveMappings: function()
      {
         var tbody = Dom.get(this.id + "-mapping-table-body");
         var inputs = tbody.querySelectorAll("input.mapping-input, select.mapping-select");
         var mappings = {};

         for (var i = 0; i < inputs.length; i++)
         {
            var fieldId = inputs[i].getAttribute("data-field-id");
            var prop = inputs[i].getAttribute("data-prop");
            if (!mappings[fieldId]) mappings[fieldId] = {};
            mappings[fieldId][prop] = inputs[i].value.trim();
         }

         this.folderConfig.fieldMapping = mappings;

         CMOD.saveFolderConfig(this.configFolderNodeId, this.selectedFolderId, this.folderConfig, function()
         {
            Alfresco.util.PopupManager.displayMessage({ text: "Field mappings saved" });
         }, this);
      }
   });
})();
