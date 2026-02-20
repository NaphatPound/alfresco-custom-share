/**
 * CMOD Field Information component
 *
 * Configures per-field search properties: allowed operators, query order,
 * hit list display, sort order, and required/fixed/wildcard toggles.
 *
 * @namespace Alfresco.component
 * @class Alfresco.component.CmodFieldInformation
 */
(function()
{
   var Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event,
      CMOD = Alfresco.component.CmodCommon;

   Alfresco.component.CmodFieldInformation = function(htmlId)
   {
      Alfresco.component.CmodFieldInformation.superclass.constructor.call(this, "Alfresco.component.CmodFieldInformation", htmlId);

      this.configFolderNodeId = null;
      this.folders = [];
      this.selectedFolderId = null;
      this.folderConfig = null;
      this.selectedFieldId = null;

      return this;
   };

   YAHOO.extend(Alfresco.component.CmodFieldInformation, Alfresco.component.Base,
   {
      onReady: function()
      {
         var me = this;

         Event.on(this.id + "-folder-select", "change", this.onFolderChange, this, true);
         Event.on(this.id + "-field-select", "change", this.onFieldChange, this, true);
         Event.on(this.id + "-save-info-btn", "click", this.onSave, this, true);

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
         this.selectedFieldId = null;
         Dom.get(this.id + "-config-panel").style.display = "none";

         if (this.selectedFolderId)
         {
            this._loadFolderConfig();
         }
         else
         {
            this._resetFieldSelector();
         }
      },

      _loadFolderConfig: function()
      {
         var me = this;
         CMOD.loadFolderConfig(this.configFolderNodeId, this.selectedFolderId, function(config)
         {
            me.folderConfig = config;
            me._populateFieldSelector();
         }, this);
      },

      _populateFieldSelector: function()
      {
         var fieldSelect = Dom.get(this.id + "-field-select");
         fieldSelect.innerHTML = '<option value="">-- Select Field --</option>';
         var fields = this.folderConfig.fieldDefinitions || [];
         for (var i = 0; i < fields.length; i++)
         {
            var opt = document.createElement("option");
            opt.value = fields[i].id;
            opt.textContent = fields[i].name;
            fieldSelect.appendChild(opt);
         }
         Dom.get(this.id + "-empty-message").style.display = fields.length === 0 ? "block" : "none";
      },

      _resetFieldSelector: function()
      {
         Dom.get(this.id + "-field-select").innerHTML = '<option value="">-- Select Field --</option>';
         Dom.get(this.id + "-empty-message").style.display = "block";
      },

      onFieldChange: function()
      {
         var sel = Dom.get(this.id + "-field-select");
         this.selectedFieldId = sel.value;

         if (this.selectedFieldId)
         {
            this._loadFieldInfo();
            Dom.get(this.id + "-config-panel").style.display = "block";
            Dom.get(this.id + "-empty-message").style.display = "none";
         }
         else
         {
            Dom.get(this.id + "-config-panel").style.display = "none";
            Dom.get(this.id + "-empty-message").style.display = "block";
         }
      },

      _loadFieldInfo: function()
      {
         var info = (this.folderConfig.fieldInformation || {})[this.selectedFieldId] || {};

         // Set operators
         var opContainer = Dom.get(this.id + "-operators");
         var checkboxes = opContainer.getElementsByTagName("input");
         var allowedOps = info.operators || [];
         for (var i = 0; i < checkboxes.length; i++)
         {
            checkboxes[i].checked = allowedOps.indexOf(checkboxes[i].value) !== -1;
         }

         // Set other fields
         Dom.get(this.id + "-query-order").value = info.queryOrder || 0;
         Dom.get(this.id + "-hit-list-display").value = info.hitListDisplay !== false ? "true" : "false";
         Dom.get(this.id + "-sort-order").value = info.sortOrder || 0;
         Dom.get(this.id + "-required").checked = !!info.required;
         Dom.get(this.id + "-fixed").checked = !!info.fixed;
         Dom.get(this.id + "-wildcard").checked = !!info.wildCard;
      },

      onSave: function()
      {
         if (!this.selectedFieldId) return;

         // Gather operators
         var opContainer = Dom.get(this.id + "-operators");
         var checkboxes = opContainer.getElementsByTagName("input");
         var operators = [];
         for (var i = 0; i < checkboxes.length; i++)
         {
            if (checkboxes[i].checked) operators.push(checkboxes[i].value);
         }

         var info = {
            operators: operators,
            queryOrder: parseInt(Dom.get(this.id + "-query-order").value, 10) || 0,
            hitListDisplay: Dom.get(this.id + "-hit-list-display").value === "true",
            sortOrder: parseInt(Dom.get(this.id + "-sort-order").value, 10) || 0,
            required: Dom.get(this.id + "-required").checked,
            fixed: Dom.get(this.id + "-fixed").checked,
            wildCard: Dom.get(this.id + "-wildcard").checked
         };

         if (!this.folderConfig.fieldInformation) this.folderConfig.fieldInformation = {};
         this.folderConfig.fieldInformation[this.selectedFieldId] = info;

         CMOD.saveFolderConfig(this.configFolderNodeId, this.selectedFolderId, this.folderConfig, function()
         {
            Alfresco.util.PopupManager.displayMessage({ text: "Field information saved" });
         }, this);
      }
   });
})();
