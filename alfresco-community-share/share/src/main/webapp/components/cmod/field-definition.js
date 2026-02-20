/**
 * CMOD Field Definition component
 *
 * Manages field definitions per CMOD folder: add/edit/delete fields with
 * name, description, fieldType, and mappingType.
 *
 * @namespace Alfresco.component
 * @class Alfresco.component.CmodFieldDefinition
 */
(function()
{
   var Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event,
      CMOD = Alfresco.component.CmodCommon;

   Alfresco.component.CmodFieldDefinition = function(htmlId)
   {
      Alfresco.component.CmodFieldDefinition.superclass.constructor.call(this, "Alfresco.component.CmodFieldDefinition", htmlId);

      this.configFolderNodeId = null;
      this.folders = [];
      this.selectedFolderId = null;
      this.folderConfig = null;
      this.selectedFieldIndex = -1;
      this.editMode = false;

      return this;
   };

   YAHOO.extend(Alfresco.component.CmodFieldDefinition, Alfresco.component.Base,
   {
      onReady: function()
      {
         var me = this;

         // Bind events
         Event.on(this.id + "-folder-select", "change", this.onFolderChange, this, true);
         Event.on(this.id + "-add-folder-btn", "click", this.onAddFolder, this, true);
         Event.on(this.id + "-delete-folder-btn", "click", this.onDeleteFolder, this, true);
         Event.on(this.id + "-add-field-btn", "click", this.onAddField, this, true);
         Event.on(this.id + "-edit-field-btn", "click", this.onEditField, this, true);
         Event.on(this.id + "-delete-field-btn", "click", this.onDeleteField, this, true);
         Event.on(this.id + "-save-field-btn", "click", this.onSaveField, this, true);
         Event.on(this.id + "-cancel-field-btn", "click", this.onCancelField, this, true);

         // Initialize
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
         this.selectedFieldIndex = -1;
         if (this.selectedFolderId)
         {
            this._loadFolderConfig();
         }
         else
         {
            this._renderEmptyTable();
         }
      },

      _loadFolderConfig: function()
      {
         var me = this;
         CMOD.loadFolderConfig(this.configFolderNodeId, this.selectedFolderId, function(config)
         {
            me.folderConfig = config;
            me._renderFieldTable();
         }, this);
      },

      _renderFieldTable: function()
      {
         var tbody = Dom.get(this.id + "-field-table-body");
         var fields = this.folderConfig.fieldDefinitions || [];
         if (fields.length === 0)
         {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-message">No fields defined. Click "Add Field" to create one.</td></tr>';
            return;
         }
         var html = "";
         for (var i = 0; i < fields.length; i++)
         {
            var f = fields[i];
            var cls = (i === this.selectedFieldIndex) ? ' class="selected"' : '';
            html += '<tr data-index="' + i + '"' + cls + '>' +
               '<td>' + Alfresco.util.encodeHTML(f.name) + '</td>' +
               '<td>' + Alfresco.util.encodeHTML(f.description || '') + '</td>' +
               '<td>' + Alfresco.util.encodeHTML(f.fieldType) + '</td>' +
               '<td>' + Alfresco.util.encodeHTML(f.mappingType) + '</td>' +
               '</tr>';
         }
         tbody.innerHTML = html;

         // Bind row click
         var rows = tbody.getElementsByTagName("tr");
         for (var j = 0; j < rows.length; j++)
         {
            Event.on(rows[j], "click", this._onRowClick, this, true);
         }
      },

      _renderEmptyTable: function()
      {
         Dom.get(this.id + "-field-table-body").innerHTML =
            '<tr><td colspan="4" class="empty-message">Select a folder to view fields</td></tr>';
      },

      _onRowClick: function(e)
      {
         var row = e.currentTarget || e.target;
         while (row && row.tagName !== "TR") row = row.parentNode;
         if (row && row.getAttribute("data-index") !== null)
         {
            this.selectedFieldIndex = parseInt(row.getAttribute("data-index"), 10);
            this._renderFieldTable();
         }
      },

      onAddFolder: function()
      {
         var name = prompt("Enter folder name:");
         if (!name || !name.trim()) return;

         var folderId = CMOD.generateId();
         this.folders.push({ id: folderId, name: name.trim() });

         var me = this;
         CMOD.saveFolderRegistry(this.configFolderNodeId, this.folders, function()
         {
            me.selectedFolderId = folderId;
            me._loadFolders();
            me._loadFolderConfig();
            Alfresco.util.PopupManager.displayMessage({ text: "Folder created: " + name.trim() });
         }, this);
      },

      onDeleteFolder: function()
      {
         if (!this.selectedFolderId)
         {
            Alfresco.util.PopupManager.displayMessage({ text: "Please select a folder first" });
            return;
         }
         var folderName = "";
         for (var i = 0; i < this.folders.length; i++)
         {
            if (this.folders[i].id === this.selectedFolderId) { folderName = this.folders[i].name; break; }
         }
         if (!confirm("Delete folder '" + folderName + "' and all its configuration?")) return;

         this.folders = this.folders.filter(function(f) { return f.id !== this.selectedFolderId; }.bind(this));
         this.selectedFolderId = null;
         this.folderConfig = null;
         this.selectedFieldIndex = -1;

         var me = this;
         CMOD.saveFolderRegistry(this.configFolderNodeId, this.folders, function()
         {
            me._loadFolders();
            me._renderEmptyTable();
            Alfresco.util.PopupManager.displayMessage({ text: "Folder deleted" });
         }, this);
      },

      onAddField: function()
      {
         if (!this.selectedFolderId)
         {
            Alfresco.util.PopupManager.displayMessage({ text: "Please select a folder first" });
            return;
         }
         this.editMode = false;
         Dom.get(this.id + "-form-title").innerHTML = "Add Field";
         Dom.get(this.id + "-field-name").value = "";
         Dom.get(this.id + "-field-desc").value = "";
         Dom.get(this.id + "-field-type").value = "String";
         Dom.get(this.id + "-mapping-type").value = "Field";
         Dom.get(this.id + "-field-form").style.display = "block";
      },

      onEditField: function()
      {
         if (this.selectedFieldIndex < 0)
         {
            Alfresco.util.PopupManager.displayMessage({ text: "Please select a field first" });
            return;
         }
         var field = this.folderConfig.fieldDefinitions[this.selectedFieldIndex];
         this.editMode = true;
         Dom.get(this.id + "-form-title").innerHTML = "Edit Field";
         Dom.get(this.id + "-field-name").value = field.name;
         Dom.get(this.id + "-field-desc").value = field.description || "";
         Dom.get(this.id + "-field-type").value = field.fieldType;
         Dom.get(this.id + "-mapping-type").value = field.mappingType;
         Dom.get(this.id + "-field-form").style.display = "block";
      },

      onDeleteField: function()
      {
         if (this.selectedFieldIndex < 0)
         {
            Alfresco.util.PopupManager.displayMessage({ text: "Please select a field first" });
            return;
         }
         var field = this.folderConfig.fieldDefinitions[this.selectedFieldIndex];
         if (!confirm("Delete field '" + field.name + "'?")) return;

         this.folderConfig.fieldDefinitions.splice(this.selectedFieldIndex, 1);
         this.selectedFieldIndex = -1;
         this._saveFolderConfig();
      },

      onSaveField: function()
      {
         var name = Dom.get(this.id + "-field-name").value.trim();
         if (!name)
         {
            Alfresco.util.PopupManager.displayMessage({ text: "Field name is required" });
            return;
         }

         var fieldData = {
            name: name,
            description: Dom.get(this.id + "-field-desc").value.trim(),
            fieldType: Dom.get(this.id + "-field-type").value,
            mappingType: Dom.get(this.id + "-mapping-type").value
         };

         if (this.editMode)
         {
            fieldData.id = this.folderConfig.fieldDefinitions[this.selectedFieldIndex].id;
            this.folderConfig.fieldDefinitions[this.selectedFieldIndex] = fieldData;
         }
         else
         {
            fieldData.id = CMOD.generateId();
            this.folderConfig.fieldDefinitions.push(fieldData);
         }

         Dom.get(this.id + "-field-form").style.display = "none";
         this._saveFolderConfig();
      },

      onCancelField: function()
      {
         Dom.get(this.id + "-field-form").style.display = "none";
      },

      _saveFolderConfig: function()
      {
         var me = this;
         CMOD.saveFolderConfig(this.configFolderNodeId, this.selectedFolderId, this.folderConfig, function()
         {
            me._renderFieldTable();
            Alfresco.util.PopupManager.displayMessage({ text: "Configuration saved" });
         }, this);
      }
   });
})();
