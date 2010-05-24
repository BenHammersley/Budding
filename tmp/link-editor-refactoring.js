
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
          
          budding.ui.handlers.text_block = {
            click: function() {
              $('.text-block').show();
              budding.ui.clean_up_tag_editor();
              $('.text-block').css('margin-bottom', '5px');
              $('.insertion-point').show();
              $('#button-raw-import').val('Update');
              var editor_controls = $('#editor-controls').detach();
              $(this).after(editor_controls);
              var text_block_id = parseInt($(this).id().match(/(\d+)$/)[1]);
              $('#text-block-' + text_block_id).hide();
              $('#editor-controls').before($('#text-block-preview').detach());
              $('#text-block-preview').show();
              $('#text-block-preview').html(budding.document.body[text_block_id].text);
              $('#text-block-ta').val(budding.document.body[text_block_id].text);
              budding.ui.text_block_selected = true;
              budding.ui.current_text_block = text_block_id;
              $('#text-block-ta').focus();
              var content = budding.document.body[text_block_id].text;
              $('#text-block-ta')[0].setSelectionRange(content.length, content.length);
              budding.render_link_editor(text_block_id);
            }
          }
          budding.ui.handlers.editor_textarea = {
            keypress: function(e) {
              if(e.which == 13) { // enter key
                var ta_val = $('#text-block-ta').val();
                var not_changed = (budding.ui.text_block_selected && budding.document.body[budding.ui.current_text_block].text == ta_val);
                var empty = ta_val.match(/^\s*$/);
                if(not_changed || empty) {
                  budding.place_editor_controls_at_insertion_point(budding.ui.insertion_point_index);
                  return false;
                }
                budding.add_text_block(ta_val);
                return false;
              }
            },
            keyup: function(e) {
              budding.update_live_preview();
              var ta_val = $('#text-block-ta').val();
              var not_changed = (budding.ui.text_block_selected && budding.document.body[budding.ui.current_text_block].text == ta_val);
              var empty = ta_val.match(/^\s*$/);
              if(not_changed || empty) {
                $('#button-raw-import').attr('disabled', 'disabled');
                $('#text-block-type-buttonset').buttonset('refresh');
              } else {
                $('#button-raw-import').attr('disabled', '');
                $('#text-block-type-buttonset').buttonset('refresh');
              }
            }
          }
          budding.ui.handlers.link_editor_href_input = {
            change: function() {
              var tag_id = budding.ui.current_tag_editor_tag;
              if(tag_id != null) {
                var link = budding.ui.tag_editor_links[tag_id];
                link.href = $(this).val();
                var text = $('#text-block-ta').val();
                var a = text.substr(0, link.start_index);
                var b = text.substr(link.end_index);
                var link_as_html = link.as_html();
                var result = a + link_as_html + b;
                link.end_index = link.start_index + link_as_html.length;
                budding.update_text_block(budding.ui.current_text_block, result);
                $('#text-block-ta').val(result);
                $('#text-block-' + budding.ui.current_text_block).html(result);
                budding.render_link_editor.update_links(budding.document.body[budding.ui.current_text_block].text);
                $('#button-raw-import').attr('disabled', 'disabled');
                $('#text-block-type-buttonset').buttonset('refresh');
              }
            }
          };

          budding.render_link_editor = function(text_block_id) {
            var render_links = arguments.callee.render_links;
            var content = budding.document.body[text_block_id].text;
            var tag_editor = render_links(content);
            if(tag_editor) {
              $('.editor-tag').click(function() {
                $('#tag-editor-input').val('');
                $('.link-suggestion').remove();
                console.log("$('.link-suggestion').remove();");
                $('.editor-tag').removeClass('editor-tag-selected');
                var tag_id = $(this).id();
                if(budding.ui.current_tag_editor_tag != tag_id) {
                  budding.ui.current_tag_editor_tag = tag_id;
                  $(this).addClass('editor-tag-selected');
                  var tag_obj = budding.ui.tag_editor_links[budding.ui.current_tag_editor_tag];
                  if(tag_obj.href) {
                    $('#tag-editor-input').val(tag_obj.href);
                  }
                  var search_term = tag_obj.content;
                  $.get('/google-query/' + encodeURIComponent(search_term), function(data) {
                    for(var i = 0; i < 3; i++) {
                      if(data[i].href.length > 70) {
                        data[i].href = data[i].href.substr(0, 70) + " ...";
                      }
                      $('#link-suggestions').append($([
                        '<div class="link-suggestion">',
                        '<div class="link-suggestion-title">' + data[i].title + '</div>',
                        '<div class="link-suggestion-href">' + data[i].href + '</div>',
                        '</div>'
                      ].join('')));
                    }
                    $('.link-suggestion').click(function() {
                      var href = $(this).find('.link-suggestion-href');
                      $('#tag-editor-input').val(href.text());
                      budding.ui.handlers.tag_editor_input_change();
                    });
                    $('#link-suggestions').show();
                  });
                  $('#tag-editor-input').show();
                } else {
                  budding.ui.current_tag_editor_tag = null;
                  $(this).removeClass('editor-tag-selected');
                }
              });
              $('#tag-editor-input').hide();
              tag_editor.show();
            }
          };

          budding.render_link_editor.render_links = function(content) {
            var links = budding.utils.parse_tags(content);
            if(links.length) {
              var tag_editor = $('#tag-editor-box').detach();
              var tag_editor_links = tag_editor.find('#tag-editor-tags');
              var content, tag_id;
              for(var i = 0, len = links.length; i < len; i++) {
                content = links[i].content.replace(' ', '&nbsp;');
                tag_id = ['editor-tag-', i].join('');
                tag_editor_links.append($('<span id="' + tag_id + '" class="editor-tag ui-corner-all">' + content + '</span>'));
                budding.ui.tag_editor_links.list.push(links[i]);
                budding.ui.tag_editor_links[tag_id] = links[i];
              }
              $('#text-block-' + budding.ui.current_text_block).before(tag_editor);
              return tag_editor;
            } else {
              return false;
            }
          };

          budding.render_link_editor.update_links = function(content) {
            var links = budding.utils.parse_tags(content);
            var tag_id;
            for(var i = 0, len = links.length; i < len; i++) {
              tag_id = ['editor-tag-', i].join('');
              budding.ui.tag_editor_links.list[i] = links[i];
              budding.ui.tag_editor_links[tag_id] = links[i];
            }
          }
          
          $('#text-block-ta').keypress(budding.ui.handlers.editor_textarea.keypress);
          $('#text-block-ta').keyup(budding.ui.handlers.editor_textarea.keyup);
          $('#tag-editor-input').change(budding.ui.handlers.link_editor_href_input.change);
          
          // Proposed renamings:
          //
          // #text-block-ta => #editor-textarea
          // #tag-editor-input => #editor-link-href-input
          