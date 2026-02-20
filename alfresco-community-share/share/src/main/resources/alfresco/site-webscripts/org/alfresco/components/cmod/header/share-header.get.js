// Add CMOD dropdown menu to the Share header navigation bar
var appMenu = widgetUtils.findObject(model.jsonModel, "id", "HEADER_APP_MENU_BAR");
if (appMenu && appMenu.config && appMenu.config.widgets)
{
   appMenu.config.widgets.push({
      id: "HEADER_CMOD_DROPDOWN_MENU",
      name: "alfresco/header/AlfMenuBarPopup",
      config: {
         label: "CMOD",
         widgets: [
            {
               id: "HEADER_CMOD_MENU_GROUP",
               name: "alfresco/menus/AlfMenuGroup",
               config: {
                  label: "CMOD Administration",
                  widgets: [
                     {
                        name: "alfresco/header/AlfMenuItem",
                        config: {
                           id: "HEADER_CMOD_FIELD_DEFINITION",
                           label: "Field Definition",
                           targetUrl: "cmod-field-definition"
                        }
                     },
                     {
                        name: "alfresco/header/AlfMenuItem",
                        config: {
                           id: "HEADER_CMOD_FIELD_INFORMATION",
                           label: "Field Information",
                           targetUrl: "cmod-field-information"
                        }
                     },
                     {
                        name: "alfresco/header/AlfMenuItem",
                        config: {
                           id: "HEADER_CMOD_FIELD_MAPPING",
                           label: "Field Mapping",
                           targetUrl: "cmod-field-mapping"
                        }
                     },
                     {
                        name: "alfresco/header/AlfMenuItem",
                        config: {
                           id: "HEADER_CMOD_INDEXER_INFORMATION",
                           label: "Indexer Information",
                           targetUrl: "cmod-indexer-information"
                        }
                     },
                     {
                        name: "alfresco/header/AlfMenuItem",
                        config: {
                           id: "HEADER_CMOD_SEARCH",
                           label: "Search",
                           targetUrl: "cmod-search"
                        }
                     }
                  ]
               }
            }
         ]
      }
   });
}
