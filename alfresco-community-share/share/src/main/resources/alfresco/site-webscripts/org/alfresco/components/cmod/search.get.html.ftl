<@markup id="css">
   <@link href="${url.context}/res/components/cmod/cmod-common.css" group="cmod"/>
   <@link href="${url.context}/res/components/cmod/search.css" group="cmod"/>
</@>

<@markup id="js">
   <@script src="${url.context}/res/components/cmod/cmod-common.js" group="cmod"/>
   <@script src="${url.context}/res/components/cmod/search.js" group="cmod"/>
</@>

<@markup id="widgets">
   <@createWidgets group="cmod"/>
</@>

<@markup id="html">
   <@uniqueIdDiv>
      <#assign el=args.htmlid?html>
      <div id="${el}-body" class="cmod-page">
         <div class="page-title">CMOD Search</div>

         <div class="folder-selector-panel">
            <label for="${el}-folder-select">Folder:</label>
            <select id="${el}-folder-select"></select>
         </div>

         <div id="${el}-search-form" class="form-panel" style="display:none;">
            <div class="form-title">Search Criteria</div>
            <div id="${el}-search-fields">
               <!-- Dynamically generated search fields -->
            </div>
            <div class="form-actions">
               <label style="font-weight:bold;margin-right:8px;">Match:</label>
               <label><input type="radio" name="${el}-logic" value="AND" checked /> All conditions (AND)</label>
               <label style="margin-left:12px;"><input type="radio" name="${el}-logic" value="OR" /> Any condition (OR)</label>
               <span style="margin-left:16px;">
                  <button id="${el}-search-btn" class="cmod-btn cmod-btn-primary">Search</button>
                  <button id="${el}-clear-btn" class="cmod-btn">Clear</button>
               </span>
            </div>
         </div>

         <div id="${el}-results-panel" class="search-results-panel" style="display:none;">
            <div class="results-count" id="${el}-results-count"></div>
            <div class="data-table-container">
               <table class="cmod-table">
                  <thead id="${el}-results-thead">
                     <tr></tr>
                  </thead>
                  <tbody id="${el}-results-tbody">
                  </tbody>
               </table>
            </div>
         </div>

         <div id="${el}-empty-message" class="empty-message">Select a folder to begin searching</div>
      </div>
   </@>
</@>
