<@markup id="css">
   <@link href="${url.context}/res/components/cmod/cmod-common.css" group="cmod"/>
   <@link href="${url.context}/res/components/cmod/field-definition.css" group="cmod"/>
</@>

<@markup id="js">
   <@script src="${url.context}/res/components/cmod/cmod-common.js" group="cmod"/>
   <@script src="${url.context}/res/components/cmod/field-definition.js" group="cmod"/>
</@>

<@markup id="widgets">
   <@createWidgets group="cmod"/>
</@>

<@markup id="html">
   <@uniqueIdDiv>
      <#assign el=args.htmlid?html>
      <div id="${el}-body" class="cmod-page">
         <div class="page-title">CMOD Field Definition</div>

         <div class="folder-selector-panel">
            <label for="${el}-folder-select">Folder:</label>
            <select id="${el}-folder-select"></select>
            <div class="folder-actions">
               <button id="${el}-add-folder-btn" class="cmod-btn">Add Folder</button>
               <button id="${el}-delete-folder-btn" class="cmod-btn cmod-btn-danger">Delete Folder</button>
            </div>
         </div>

         <div class="toolbar">
            <button id="${el}-add-field-btn" class="cmod-btn cmod-btn-primary">Add Field</button>
            <button id="${el}-edit-field-btn" class="cmod-btn">Edit Field</button>
            <button id="${el}-delete-field-btn" class="cmod-btn cmod-btn-danger">Delete Field</button>
         </div>

         <div class="data-table-container">
            <table class="cmod-table">
               <thead>
                  <tr>
                     <th>Name</th>
                     <th>Description</th>
                     <th>Field Type</th>
                     <th>Mapping Type</th>
                  </tr>
               </thead>
               <tbody id="${el}-field-table-body">
                  <tr><td colspan="4" class="empty-message">Select a folder to view fields</td></tr>
               </tbody>
            </table>
         </div>

         <div id="${el}-field-form" class="form-panel" style="display:none;">
            <div class="form-title" id="${el}-form-title">Add Field</div>
            <div class="form-row">
               <label for="${el}-field-name">Name:</label>
               <input type="text" id="${el}-field-name" />
            </div>
            <div class="form-row">
               <label for="${el}-field-desc">Description:</label>
               <input type="text" id="${el}-field-desc" />
            </div>
            <div class="form-row">
               <label for="${el}-field-type">Field Type:</label>
               <select id="${el}-field-type">
                  <option value="String">String</option>
                  <option value="Integer">Integer</option>
                  <option value="Decimal">Decimal</option>
                  <option value="Date">Date</option>
                  <option value="DateTime">DateTime</option>
               </select>
            </div>
            <div class="form-row">
               <label for="${el}-mapping-type">Mapping Type:</label>
               <select id="${el}-mapping-type">
                  <option value="Field">Field</option>
                  <option value="Fixed">Fixed</option>
                  <option value="Segment">Segment</option>
               </select>
            </div>
            <div class="form-actions">
               <button id="${el}-save-field-btn" class="cmod-btn cmod-btn-primary">Save</button>
               <button id="${el}-cancel-field-btn" class="cmod-btn">Cancel</button>
            </div>
         </div>
      </div>
   </@>
</@>
