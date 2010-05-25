
          // Goals of this refactoring:
          // 
          // * To make the link editor appear dynamically as you're typing in the text area
          // * To make links be automatically be assigned when fragments of the text match known resources
          // * To make naming of widgets and data consistent, I seem to have been using 'tag' and 'link' interchangeably lately -- Not Good

          // Relevant HTML elements:
          // 
          // <div id="tag-editor-box">
          //   <div class="tag-editor" class="ui-corner-top">
          //     <div id="link-suggestions">
          //     </div>
          //     <input id="tag-editor-input" type="input">
          //     <div id="tag-editor-tags">
          //     </div>
          //   </div>
          // </div>
          // ...
          // <div id="editor-controls">
          //   <textarea id="text-block-ta"></textarea>
          //   <div id="text-block-type-buttonset">
          //     <input type="radio" name="radio-text-block-type" id="text-block-type-h1" value="h1"><label for="text-block-type-h1">&lt;h1&gt;</label>
          //     <input type="radio" name="radio-text-block-type" id="text-block-type-h2" value="h2"><label for="text-block-type-h2">&lt;h2&gt;</label>
          //     <input type="radio" checked="true" name="radio-text-block-type" id="text-block-type-p" value="p"><label for="text-block-type-p">&lt;p&gt;</label>
          //     <input type="radio" name="radio-text-block-type" id="text-block-type-blockquote" value="blockquote"><label for="text-block-type-blockquote">&lt;blockquote&gt;</label>
          //     <input type="button" value="Add" id="button-raw-import" style="height: 29px; margin-left: 5px;">
          //   </div>
          //   <div id="editor-save-box">
          //   </div>
          // </div>
          
          // Proposed renamings:
          //
          // budding.ui.tag_editor_links => budding.ui.link_editor.links (?)
          // #text-block-ta => #editor-textarea
          // #tag-editor-input => #editor-link-href-input
          // .editor-tag => #link-editor-link-button
          
          