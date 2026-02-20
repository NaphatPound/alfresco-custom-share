<@markup id="css">
   <@link href="${url.context}/res/components/cmod/cmod-common.css" group="cmod"/>
   <@link href="${url.context}/res/components/cmod/indexer-information.css" group="cmod"/>
</@>

<@markup id="js">
   <@script src="${url.context}/res/components/cmod/cmod-common.js" group="cmod"/>
   <@script src="${url.context}/res/components/cmod/indexer-information.js" group="cmod"/>
</@>

<@markup id="widgets">
   <@createWidgets group="cmod"/>
</@>

<@markup id="html">
   <@uniqueIdDiv>
      <#assign el=args.htmlid?html>
      <div id="${el}-body" class="cmod-page">
         <div class="page-title">CMOD Indexer Information</div>

         <div class="folder-selector-panel">
            <label for="${el}-folder-select">Folder:</label>
            <select id="${el}-folder-select"></select>
         </div>

         <!-- Triggers Section -->
         <div class="section-panel">
            <div class="section-title">
               Triggers
               <button id="${el}-add-trigger-btn" class="cmod-btn" style="float:right;margin-top:-3px;">Add Trigger</button>
            </div>
            <div class="section-body">
               <table class="cmod-table">
                  <thead>
                     <tr>
                        <th>Trigger ID</th>
                        <th>Character Value</th>
                        <th>Hex Value</th>
                        <th>Position</th>
                        <th>Actions</th>
                     </tr>
                  </thead>
                  <tbody id="${el}-triggers-table-body">
                     <tr><td colspan="5" class="empty-message">No triggers defined</td></tr>
                  </tbody>
               </table>
            </div>
         </div>

         <!-- Fields Section -->
         <div class="section-panel">
            <div class="section-title">
               Fields
               <button id="${el}-add-idxfield-btn" class="cmod-btn" style="float:right;margin-top:-3px;">Add Field</button>
            </div>
            <div class="section-body">
               <table class="cmod-table">
                  <thead>
                     <tr>
                        <th>Field ID</th>
                        <th>Name</th>
                        <th>Line Number</th>
                        <th>Column Position</th>
                        <th>Length</th>
                        <th>Actions</th>
                     </tr>
                  </thead>
                  <tbody id="${el}-fields-table-body">
                     <tr><td colspan="6" class="empty-message">No fields defined</td></tr>
                  </tbody>
               </table>
            </div>
         </div>

         <!-- Indexes Section -->
         <div class="section-panel">
            <div class="section-title">
               Indexes
               <button id="${el}-add-index-btn" class="cmod-btn" style="float:right;margin-top:-3px;">Add Index</button>
            </div>
            <div class="section-body">
               <table class="cmod-table">
                  <thead>
                     <tr>
                        <th>Index ID</th>
                        <th>Field Reference</th>
                        <th>Metadata Name</th>
                        <th>Actions</th>
                     </tr>
                  </thead>
                  <tbody id="${el}-indexes-table-body">
                     <tr><td colspan="4" class="empty-message">No indexes defined</td></tr>
                  </tbody>
               </table>
            </div>
         </div>

         <!-- Trigger Form (hidden) -->
         <div id="${el}-trigger-form" class="form-panel" style="display:none;">
            <div class="form-title" id="${el}-trigger-form-title">Add Trigger</div>
            <div class="form-row">
               <label for="${el}-trigger-char">Character Value:</label>
               <input type="text" id="${el}-trigger-char" />
            </div>
            <div class="form-row">
               <label for="${el}-trigger-hex">Hex Value:</label>
               <input type="text" id="${el}-trigger-hex" />
            </div>
            <div class="form-row">
               <label for="${el}-trigger-pos">Position:</label>
               <input type="number" id="${el}-trigger-pos" min="0" value="0" />
            </div>
            <div class="form-actions">
               <button id="${el}-save-trigger-btn" class="cmod-btn cmod-btn-primary">Save</button>
               <button id="${el}-cancel-trigger-btn" class="cmod-btn">Cancel</button>
            </div>
         </div>

         <!-- Indexer Field Form (hidden) -->
         <div id="${el}-idxfield-form" class="form-panel" style="display:none;">
            <div class="form-title" id="${el}-idxfield-form-title">Add Field</div>
            <div class="form-row">
               <label for="${el}-idxfield-name">Name:</label>
               <input type="text" id="${el}-idxfield-name" />
            </div>
            <div class="form-row">
               <label for="${el}-idxfield-line">Line Number:</label>
               <input type="number" id="${el}-idxfield-line" min="0" value="0" />
            </div>
            <div class="form-row">
               <label for="${el}-idxfield-col">Column Position:</label>
               <input type="number" id="${el}-idxfield-col" min="0" value="0" />
            </div>
            <div class="form-row">
               <label for="${el}-idxfield-len">Length:</label>
               <input type="number" id="${el}-idxfield-len" min="0" value="0" />
            </div>
            <div class="form-actions">
               <button id="${el}-save-idxfield-btn" class="cmod-btn cmod-btn-primary">Save</button>
               <button id="${el}-cancel-idxfield-btn" class="cmod-btn">Cancel</button>
            </div>
         </div>

         <!-- Index Form (hidden) -->
         <div id="${el}-index-form" class="form-panel" style="display:none;">
            <div class="form-title" id="${el}-index-form-title">Add Index</div>
            <div class="form-row">
               <label for="${el}-index-fieldref">Field Reference:</label>
               <input type="text" id="${el}-index-fieldref" />
            </div>
            <div class="form-row">
               <label for="${el}-index-meta">Metadata Name:</label>
               <input type="text" id="${el}-index-meta" />
            </div>
            <div class="form-actions">
               <button id="${el}-save-index-btn" class="cmod-btn cmod-btn-primary">Save</button>
               <button id="${el}-cancel-index-btn" class="cmod-btn">Cancel</button>
            </div>
         </div>

         <div class="form-actions" style="margin-top:16px;">
            <button id="${el}-save-all-btn" class="cmod-btn cmod-btn-primary" style="display:none;">Save All Configuration</button>
         </div>
      </div>
   </@>
</@>
