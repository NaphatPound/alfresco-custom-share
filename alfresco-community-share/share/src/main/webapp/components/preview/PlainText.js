/**
 * PlainText preview plugin for Alfresco Share.
 *
 * Renders text/plain files as raw monospace text with unlimited width
 * and horizontal scrolling, instead of converting to PDF.
 *
 * @param wp {Alfresco.WebPreview} The Alfresco.WebPreview instance
 * @param attributes {Object} Attributes from the <plugin> element
 */
Alfresco.WebPreview.prototype.Plugins.PlainText = function(wp, attributes)
{
   this.wp = wp;
   this.attributes = YAHOO.lang.merge(Alfresco.util.deepCopy(this.attributes), attributes);
   return this;
};

Alfresco.WebPreview.prototype.Plugins.PlainText.prototype =
{
   attributes:
   {
      /**
       * Maximum file size in bytes to display inline. Files larger than this
       * will still be shown but with a warning.
       *
       * @property srcMaxSize
       * @type String
       * @default "50000000"
       */
      srcMaxSize: "50000000"
   },

   /**
    * Tests if the plugin can be used in the user's browser.
    *
    * @method report
    * @return {String} Returns nothing if the plugin may be used
    */
   report: function PlainText_report()
   {
      // All modern browsers support XMLHttpRequest and <pre>
   },

   /**
    * Display the node's text content with horizontal scrolling.
    *
    * @method display
    * @public
    */
   display: function PlainText_display()
   {
      var self = this;
      var previewerEl = this.wp.getPreviewerElement();
      var contentUrl = this.wp.getContentUrl(false);

      // Show loading indicator
      previewerEl.innerHTML = '<div class="plain-text-loading">Loading text content...</div>';

      // Fetch the raw text content
      Alfresco.util.Ajax.request(
      {
         url: contentUrl,
         successCallback:
         {
            fn: function(response)
            {
               var text = response.serverResponse.responseText || '';
               self._renderText(previewerEl, text);
            },
            scope: this
         },
         failureCallback:
         {
            fn: function()
            {
               previewerEl.innerHTML = '<div class="message">' +
                  self.wp.msg("label.noPreview", self.wp.getContentUrl(true)) +
                  '</div>';
            },
            scope: this
         }
      });

      return null;
   },

   /**
    * Render the text content into the previewer element.
    *
    * @method _renderText
    * @param previewerEl {HTMLElement} The container element
    * @param text {String} The raw text content
    * @private
    */
   _renderText: function PlainText__renderText(previewerEl, text)
   {
      // Escape HTML entities
      var escaped = text
         .replace(/&/g, '&amp;')
         .replace(/</g, '&lt;')
         .replace(/>/g, '&gt;')
         .replace(/"/g, '&quot;');

      // Build line numbers
      var lines = text.split('\n');
      var lineCount = lines.length;
      var lineNumbers = [];
      for (var i = 1; i <= lineCount; i++)
      {
         lineNumbers.push(i);
      }

      var html = '';
      html += '<div class="plain-text-preview">';
      html += '  <div class="plain-text-toolbar">';
      html += '    <span class="plain-text-info">' + this._escapeHtml(this.wp.options.name) + '</span>';
      html += '    <span class="plain-text-line-count">' + lineCount + ' lines</span>';
      html += '    <a class="plain-text-download" href="' + this.wp.getContentUrl(true) + '">Download</a>';
      html += '  </div>';
      html += '  <div class="plain-text-container">';
      html += '    <div class="plain-text-gutter"><pre class="plain-text-line-numbers">' + lineNumbers.join('\n') + '</pre></div>';
      html += '    <div class="plain-text-content"><pre class="plain-text-code">' + escaped + '</pre></div>';
      html += '  </div>';
      html += '</div>';

      previewerEl.innerHTML = html;

      // Sync vertical scroll between gutter and content
      var container = previewerEl.querySelector('.plain-text-content');
      var gutter = previewerEl.querySelector('.plain-text-gutter');
      if (container && gutter)
      {
         container.addEventListener('scroll', function()
         {
            gutter.scrollTop = container.scrollTop;
         });
      }
   },

   /**
    * Escape HTML special characters.
    *
    * @method _escapeHtml
    * @param str {String} Input string
    * @return {String} Escaped string
    * @private
    */
   _escapeHtml: function PlainText__escapeHtml(str)
   {
      return str
         .replace(/&/g, '&amp;')
         .replace(/</g, '&lt;')
         .replace(/>/g, '&gt;')
         .replace(/"/g, '&quot;');
   }
};
