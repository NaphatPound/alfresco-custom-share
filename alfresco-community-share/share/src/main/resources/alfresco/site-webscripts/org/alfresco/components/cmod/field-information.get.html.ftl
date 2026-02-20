<@markup id="css">
   <@link href="${url.context}/res/components/cmod/cmod-common.css" group="cmod"/>
   <@link href="${url.context}/res/components/cmod/field-information.css" group="cmod"/>
</@>

<@markup id="js">
   <@script src="${url.context}/res/components/cmod/cmod-common.js" group="cmod"/>
   <@script src="${url.context}/res/components/cmod/field-information.js" group="cmod"/>
</@>

<@markup id="widgets">
   <@createWidgets group="cmod"/>
</@>

<@markup id="html">
   <@uniqueIdDiv>
      <#assign el=args.htmlid?html>
      <div id="${el}-body" class="cmod-page">
         <div class="page-title">CMOD Field Information</div>

         <div class="folder-selector-panel">
            <label for="${el}-folder-select">Folder:</label>
            <select id="${el}-folder-select"></select>
         </div>

         <div class="field-selector-panel">
            <label for="${el}-field-select">Field:</label>
            <select id="${el}-field-select">
               <option value="">-- Select Field --</option>
            </select>
         </div>

         <div id="${el}-config-panel" class="form-panel" style="display:none;">
            <div class="form-title">Field Information Configuration</div>

            <div class="form-row">
               <label>Operators:</label>
               <div class="checkbox-group" id="${el}-operators">
                  <label><input type="checkbox" value="Equal" /> Equal</label>
                  <label><input type="checkbox" value="Not Equal" /> Not Equal</label>
                  <label><input type="checkbox" value="Less Than" /> Less Than</label>
                  <label><input type="checkbox" value="Less Than or Equal" /> Less Than or Equal</label>
                  <label><input type="checkbox" value="Greater Than" /> Greater Than</label>
                  <label><input type="checkbox" value="Greater Than or Equal" /> Greater Than or Equal</label>
                  <label><input type="checkbox" value="Like" /> Like</label>
                  <label><input type="checkbox" value="Not Like" /> Not Like</label>
                  <label><input type="checkbox" value="Between" /> Between</label>
                  <label><input type="checkbox" value="Not Between" /> Not Between</label>
                  <label><input type="checkbox" value="In" /> In</label>
                  <label><input type="checkbox" value="Not In" /> Not In</label>
               </div>
            </div>

            <div class="form-row">
               <label for="${el}-query-order">Query Order:</label>
               <input type="number" id="${el}-query-order" min="0" value="0" />
            </div>

            <div class="form-row">
               <label for="${el}-hit-list-display">Hit List Display:</label>
               <select id="${el}-hit-list-display">
                  <option value="true">Yes</option>
                  <option value="false">No</option>
               </select>
            </div>

            <div class="form-row">
               <label for="${el}-sort-order">Sort Order:</label>
               <input type="number" id="${el}-sort-order" min="0" value="0" />
            </div>

            <div class="form-row">
               <label>Options:</label>
               <div class="checkbox-group" id="${el}-options">
                  <label><input type="checkbox" id="${el}-required" /> Required</label>
                  <label><input type="checkbox" id="${el}-fixed" /> Fixed Value</label>
                  <label><input type="checkbox" id="${el}-wildcard" /> Wildcard Allowed</label>
               </div>
            </div>

            <div class="form-actions">
               <button id="${el}-save-info-btn" class="cmod-btn cmod-btn-primary">Save</button>
            </div>
         </div>

         <div id="${el}-empty-message" class="empty-message">Select a folder and field to configure</div>
      </div>
   </@>
</@>
