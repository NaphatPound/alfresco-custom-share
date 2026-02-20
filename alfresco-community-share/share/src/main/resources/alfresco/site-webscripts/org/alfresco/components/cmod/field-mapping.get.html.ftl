<@markup id="css">
   <@link href="${url.context}/res/components/cmod/cmod-common.css" group="cmod"/>
   <@link href="${url.context}/res/components/cmod/field-mapping.css" group="cmod"/>
</@>

<@markup id="js">
   <@script src="${url.context}/res/components/cmod/cmod-common.js" group="cmod"/>
   <@script src="${url.context}/res/components/cmod/field-mapping.js" group="cmod"/>
</@>

<@markup id="widgets">
   <@createWidgets group="cmod"/>
</@>

<@markup id="html">
   <@uniqueIdDiv>
      <#assign el=args.htmlid?html>
      <div id="${el}-body" class="cmod-page">
         <div class="page-title">CMOD Field Mapping</div>

         <div class="folder-selector-panel">
            <label for="${el}-folder-select">Folder:</label>
            <select id="${el}-folder-select"></select>
         </div>

         <div class="data-table-container">
            <table class="cmod-table">
               <thead>
                  <tr>
                     <th>Field Name</th>
                     <th>Database Field Name (Alfresco Property)</th>
                     <th>Application Group</th>
                     <th>Actions</th>
                  </tr>
               </thead>
               <tbody id="${el}-mapping-table-body">
                  <tr><td colspan="4" class="empty-message">Select a folder to view field mappings</td></tr>
               </tbody>
            </table>
         </div>

         <div class="form-actions" style="margin-top:12px;">
            <button id="${el}-save-mappings-btn" class="cmod-btn cmod-btn-primary" style="display:none;">Save All Mappings</button>
         </div>
      </div>
   </@>
</@>
