
jQuery.fn.id = function() {  
  var ids = [];
  this.each(function() {
    ids.push(jQuery(this).attr('id'));
  });
  if(ids.length > 1) return ids;
  else return ids[0];
};

budding = {
  ui: {
    editor_settings: {},
    use_first_paragraph_as_title: true,
    currentFragments: {text: [], elements: []},
    text_block_selected: false,
    current_text_block: null,
    current_text_block_type: null,
    current_tag_editor_tag: null,
    last_text_area_val: '',
    tag_editor_enabled: false,
    tag_editor_links: {list: []},
    text_block_preview_hide_timeout: null,
    insertion_point_index: 0,
    handlers: {}
  },
  utils: {},
  identified_tags: {}
};

budding.Document = function() {
  this.body = [];
}

$.extend(budding.Document.prototype, {
  single_string: function() {
    return $.map(this.body, function(tb) { 
      var text_block_class = ['text-block-', tb.tag].join('');
      var text_block_start = ['<p class="', text_block_class, '">'].join('');
      var text_block_end = ['</p>'].join('');
      return [text_block_start, tb.text, text_block_end].join('');
    }).join("\n");
  },
  changed: function() {
  }
});

budding.document = new budding.Document();

budding.ui.clean_up_tag_editor = function() {
  budding.ui.tag_editor_links = {list: []};
  budding.ui.current_tag_editor_tag = null;
  budding.ui.tag_editor_enabled = false;
  budding.ui.link_editor_href_input_last_value = null;
  $('#tag-editor-box').hide();
  $('#tag-editor-input').hide();
  $('.editor-tag').remove();
  $('.link-suggestion').remove();
};

budding.ui.at_the_first_line = function() {
  var condition_a = (budding.ui.text_block_selected && budding.ui.current_text_block == 0);
  var condition_b = (budding.ui.insertion_point_index == 0 && !$('#text-block-0').length);
  return condition_a || condition_b;
};

budding.ui.handlers.text_block = {
  click: function() {
    
    $('#button-raw-import').val('Update');
    
    $('#text-block-preview').css('margin-top', '0px');
    $('#tag-editor-box').css('margin-top', '0px');

    
    // $('#editor-controls').css('margin-bottom', '5px');
    $('.text-block').show();
    
    budding.ui.clean_up_tag_editor();
    
    var editor_controls = $('#editor-controls').detach();
    $(this).after(editor_controls);
    
    var text_block_id = parseInt($(this).id().match(/(\d+)$/)[1]);
    
    $('.insertion-point').css('margin-bottom', '0px');
    var insertion_point_above = $('#insertion-point-' + (text_block_id-1));
    if(insertion_point_above.length) {
      insertion_point_above.css('margin-bottom', '5px');
    }
    $('.insertion-point').show();
    
    $('#text-block-' + text_block_id).hide();
    
    var content = budding.document.body[text_block_id].text;
    var tag = budding.document.body[text_block_id].tag;

    var classes = ['h1', 'h2', 'blockquote', 'p'];
    for(var i = 0, len = classes.length; i < len; i++) {
      if(classes[i] != tag) {
        $('#text-block-type-' + classes[i]).attr('checked', 'false');
      } 
    }
    $('#text-block-type-' + tag).attr('checked', 'true');
    $('#text-block-type-buttonset').buttonset('refresh');
    budding.ui.handlers.text_block_type_select();
    
    $('#editor-controls').before($('#text-block-preview').detach());
    $('#text-block-preview').html(content);
    $('#text-block-preview').show();
    
    $('#text-block-ta').val(content);
    
    budding.ui.text_block_selected = true;
    budding.ui.current_text_block = text_block_id;
    
    $('#text-block-ta').focus();
    $('#text-block-ta')[0].setSelectionRange(content.length, content.length);
    
    budding.render_link_editor(content);
  }
}

budding.ui.handlers.editor_textarea = {
  
  keypress: function(e) {
    if(e.which == 13) { // enter key
      var ta_val = $('#text-block-ta').val();
      var empty = ta_val. match(/^\s*$/);
      if(budding.has_text_block_changed() || !empty) {
        budding.add_text_block(ta_val);
      } else {
        return false;
      }
      return false;
    }
  },
  
  keyup: function(e) {
    budding.update_live_preview();
    var ta_val = budding.identify_tags($('#text-block-ta').val());
    $('#text-block-ta').val(ta_val);
    // if(text_with_identified_tags != budding.document.body[budding.ui.current_text_block].text) {
    //   budding.document.body[budding.ui.current_text_block].text = text_with_identified_tags;
    // }
    // var ta_val = budding.document.body[budding.ui.current_text_block].text;
    var not_changed = (budding.ui.text_block_selected && budding.document.body[budding.ui.current_text_block].text == ta_val);
    var empty = ta_val.match(/^\s*$/);
    if(not_changed || empty) {
      $('#button-raw-import').attr('disabled', 'disabled');
      $('#text-block-type-buttonset').buttonset('refresh');
    } else {
      $('#button-raw-import').attr('disabled', '');
      $('#text-block-type-buttonset').buttonset('refresh');
    }
    budding.render_link_editor(ta_val);
  }
  
}

budding.ui.handlers.link_editor_href_input = {
  keyup: function(e) {
    var current_value = $(this).val();
    if(budding.ui.link_editor_href_input_last_value != current_value) {
      var tag_id = budding.ui.current_tag_editor_tag;
      if(tag_id != null) {
        var link = budding.ui.tag_editor_links[tag_id];
        link.href = current_value;
        var text = $('#text-block-ta').val();
        var a = text.substr(0, link.start_index);
        var b = text.substr(link.end_index);
        var link_as_html = link.as_html();
        var result = a + link_as_html + b;
        link.end_index = link.start_index + link_as_html.length;
        $('#text-block-ta').val(result);
        budding.ui.handlers.editor_textarea.keyup.call($('#text-block-ta'));
        $('#button-raw-import').attr('disabled', '');
        $('#text-block-type-buttonset').buttonset('refresh');
      }
      budding.ui.link_editor_href_input_last_value = current_value;
    }
  }
};

budding.ui.handlers.link_editor_link_button = {
  click: function() {
    $('#tag-editor-input').show();
    $('#tag-editor-input').val('');
    $('.link-suggestion').remove();
    var tag_id = $(this).id();
    if(budding.ui.current_tag_editor_tag != tag_id) {
      $('.editor-tag').removeClass('editor-tag-selected');
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
          budding.ui.handlers.link_editor_href_input.keyup.call($('#tag-editor-input'));
        });
        $('#link-suggestions').show();
      });
      $('#tag-editor-input').show();
    } else {
      $('#tag-editor-input').hide();
      budding.ui.current_tag_editor_tag = null;
      $(this).removeClass('editor-tag-selected');
    }
  }
};

budding.render_link_editor = function(text) {
  var links = budding.utils.parse_tags(text)[0];
  if(links && links.length) {
    var tag_editor = $('#tag-editor-box').detach();
    var tag_editor_links = tag_editor.find('#tag-editor-tags');
    var new_link, content, tag_id;
    var total_current_links = budding.ui.tag_editor_links.list.length;
    for(var i = 0, len = links.length; i < len; i++) {
      new_link = links[i];
      content = new_link.content.replace(' ', '&nbsp;');
      tag_id = ['editor-tag-', i].join('');
      if(budding.ui.tag_editor_enabled && i < total_current_links) {
        var current_link = budding.ui.tag_editor_links.list[i];
        if(current_link.content != new_link.content) {
          $('#' + tag_id).html(content);
          current_link.content = new_link.content;
        }
        current_link.start_index = new_link.start_index;
        current_link.end_index = new_link.end_index;
        current_link.href = new_link.href;
      } else {
        budding.ui.tag_editor_links.list.push(links[i]);
        budding.ui.tag_editor_links[tag_id] = links[i];
        var tag_elem = $('<span id="' + tag_id + '" class="editor-tag ui-corner-all">' + content + '</span>')
        tag_editor_links.append(tag_elem);
      }
    }
    if(budding.ui.text_block_selected) {
      $('#text-block-' + budding.ui.current_text_block).before(tag_editor);
    } else {
      $('#text-block-preview').before(tag_editor);
    }
    $('.editor-tag').unbind('click', budding.ui.handlers.link_editor_link_button.click);
    $('.editor-tag').click(budding.ui.handlers.link_editor_link_button.click);
    tag_editor.show();
    budding.ui.tag_editor_enabled = true;
    $(budding.ui.current_focus).focus();
  } else {
    budding.ui.clean_up_tag_editor();
    return false;
  }
};

budding.render_link_editor.update_links = function(content) {
  var links = budding.utils.parse_tags(content)[0];
  var tag_id;
  for(var i = 0, len = links.length; i < len; i++) {
    tag_id = ['editor-tag-', i].join('');
    budding.ui.tag_editor_links.list[i] = links[i];
    budding.ui.tag_editor_links[tag_id] = links[i];
  }
};

budding.ui.handlers.text_block_type_select = function() { 
  var tag = $('input[name=radio-text-block-type]:checked').val();
  var text_block_preview = $('#text-block-preview');
  var classes = ['h1', 'h2', 'p', 'blockquote'];
  for(var i = 0, len = classes.length; i < len; i++) {
    text_block_preview.removeClass('text-block-' + classes[i]);
  }
  text_block_preview.addClass('text-block-' + tag);
  budding.ui.current_text_block_type = tag;
  if(budding.ui.text_block_selected) {
    var tag = budding.document.body[budding.ui.current_text_block].tag;
    if(tag != budding.ui.current_text_block_type) {
      $('#button-raw-import').attr('disabled', '');
      $('#text-block-type-buttonset').buttonset('refresh'); 
    } else {
      $('#button-raw-import').attr('disabled', 'disabled');
      $('#text-block-type-buttonset').buttonset('refresh');       
    }
  }
};

budding.utils.parse_tags = function(s) {
  var extract_tag = arguments.callee.extract_tag;
  var current_tag = null;
  var tags = [];
  for(var c, i = 0, len = s.length; i < len; i++) {
    c = s.charAt(i);
    if(c == '<') {
      var tag = extract_tag(i, s.substr(i));
      if(tag) {
        if(tag.start) {
          tags.push(tag);
          current_tag = tags.length-1;
          tags[current_tag].content = [];
        } else if(tag.end) {
          if(tag.name == tags[current_tag].name){
            tags[current_tag].closed = true;
            tags[current_tag].content = tags[current_tag].content.join('');
            tags[current_tag].end_index = tag.end_index;
            current_tag = null;
          }
        }
        i = tag.next_index;
      }
    } else if(current_tag != null) {
      tags[current_tag].content.push(c);
    }   
  }
  var closed_tags = [], unclosed_tags = [];
  for(var i = 0, len = tags.length; i < len; i++) {
    if(tags[i].closed) closed_tags.push(tags[i]);
    else unclosed_tags.push(tags[i]);
  }
  return [closed_tags, unclosed_tags];
}

budding.utils.parse_tags.Tag = function() {
}

$.extend(budding.utils.parse_tags.Tag.prototype, {
  as_html: function() {
    if(this.href) {
      return ['<', this.name, ' href="', this.href.replace('"', '\\"'), '">', this.content, '</', this.name, '>'].join('');
    } else {
      return ['<', this.name, '>', this.content, '</', this.name, '>'].join('');
    }
  }
});

budding.utils.parse_tags.extract_tag = function(i, str) {
  var tag = new budding.utils.parse_tags.Tag;
  var start_tag = str.match(/^<([-a-z]+)>/i);
  var start_tag_with_href = str.match(/^<([-a-z]+) +href=["']([^"']*)["']>/i);
  var end_tag = str.match(/^<\/([-a-z]+)>/i);
  if(start_tag) {
    tag.name = start_tag[1];
    tag.start = true;
    tag.start_index = i;
    tag.next_index = i+start_tag[0].length-1;
  } else if(start_tag_with_href) {
    tag.name = start_tag_with_href[1];
    tag.start = true;
    tag.href = start_tag_with_href[2];
    tag.start_index = i;
    tag.next_index = i+start_tag_with_href[0].length-1;    
  } else if(end_tag) {
    tag.name = end_tag[1];
    tag.end = true;
    tag.next_index = i+end_tag[0].length;
    tag.end_index = i+end_tag[0].length;
  } else {
    return false;
  }
  return tag;
}

budding.load_known_tags = function() {
  $.get('/tags', function(data) {
    budding.known_tags = {};
    for(var i = 0, len = data.length; i < len; i++) {
      budding.known_tags[data[i].name] = data[i].category;
    }
  }, 'json');
}

budding.update_save_button = function() {
  if(budding.document.changed()) {
    //
  }
};

budding.update_live_preview = function() {
  clearTimeout(budding.ui.text_block_preview_hide_timeout);
  var ta_val = $('#text-block-ta').val();
  var parsed_tags = budding.utils.parse_tags(ta_val);
  var closed_tags = parsed_tags[0]// , unclosed_tags = parsed_tags[1];
  // for(var start, end, i = 0, len = unclosed_tags.length; i < len; i++) {
  //   start = ta_val.substr(0, unclosed_tags[i].start_index);
  //   end = ta_val.substr(unclosed_tags[i].next_index+1);
  //   ta_val = start+ end;
  // }
  var multi_line_import = ta_val.split(/\n\n/).length > 1;
  if(ta_val != budding.ui.last_text_area_val && !multi_line_import) {
    if(!$('#text-block-preview').is(":visible")) {
      $('#text-block-preview').show();
    }
    if(closed_tags.length) {
      $('#text-block-preview').html(ta_val);
    } else {
      $('#text-block-preview').text(ta_val);
    }
    if(budding.ui.use_first_paragraph_as_title && budding.ui.at_the_first_line()) {
      $('#document-title-input').val(ta_val);
    }
    if(ta_val.length == 0) {
      budding.ui.text_block_preview_hide_timeout = setTimeout(function() {
        $('#text-block-preview').hide();
      }, 3000);
    }
  }
  budding.ui.last_text_area_val = ta_val;
};

budding.parse_text_blocks = function() {
  var text_blocks = $('.text-block');
  for(var text_block_hash, i = 0, len = text_blocks.length; i < len; i++) {
    text_block_hash = {text: $.trim($(text_blocks[i]).html())};
    this.document.body.push(text_block_hash);
    text_block_hash.id = this.document.body.length-1;
    $(text_blocks[i]).click(budding.ui.handlers.text_block.click);
  }
  this.ui.insertion_point_index = this.document.body.length ? this.document.body.length-1 : 0;
}

budding.remove_text_block = function(id) {
  var to_be_removed = this.document.body[id];
  delete this.document.body[id];
  return to_be_removed; // whole object
};


budding.add_text_block = function(text, raw_text_import) {
  
  text = $.trim(text);
  var text_block_hash = {'text': text};
  var p = $('<p class="text-block"></p>').html(text);
  var new_insertion_point = $('<div class="insertion-point"></div>');
  
  text_block_hash.id = budding.ui.insertion_point_index;
  text_block_hash.tag = raw_text_import ? 'p' : budding.ui.current_text_block_type;
  
  p.attr('id', 'text-block-' + text_block_hash.id);
  p.addClass('text-block-' + text_block_hash.tag);
        
  var text_block = $('#text-block-' + text_block_hash.id);
  
  $('#text-block-preview').hide();
  budding.ui.last_text_area_val = '';
  
  if(budding.ui.text_block_selected) {
    budding.update_text_block(budding.ui.current_text_block, text);
    p = $('#text-block-' + budding.ui.current_text_block);
    p.html(text);
    var classes = ['h1', 'h2', 'p', 'blockquote'];
    for(var i = 0, len = classes.length; i < len; i++) {
      p.removeClass('text-block-' + classes[i]);
    }
    p.addClass('text-block-' + text_block_hash.tag);
    console.log("p.attr('class'): " + p.attr('class'));
    budding.place_editor_controls_at_insertion_point(budding.ui.current_text_block);
    // budding.make_fragments_clickable();
  } else {
    if(!text_block.length) { /* refactorable: if(document.is_empty()) */
      this.document.body.splice(text_block_hash.id, 0, text_block_hash);
      p.attr('id', 'text-block-' + text_block_hash.id);
      $('#insertion-point-' + text_block_hash.id).before(p);
    } else {
      $('#insertion-point-' + text_block_hash.id).show();
      text_block_hash.id += 1;
      var text_blocks = $('.text-block');
      var insertion_points = $('.insertion-point');
      for(var i = text_block_hash.id, len = text_blocks.length; i < len; i++) {
        $(text_blocks[i]).attr('id', 'text-block-' + (i+1));
        $(insertion_points[i]).attr('id', 'insertion-point-' + (i+1));
        this.document.body[i].id = i+1;
      }
      $('#editor-controls').after(new_insertion_point);
      this.document.body.splice(text_block_hash.id, 0, text_block_hash);
      p.attr('id', 'text-block-' + text_block_hash.id);
      new_insertion_point.before(p);
      new_insertion_point.attr('id', 'insertion-point-' + text_block_hash.id);
    }
    budding.place_editor_controls_at_insertion_point(text_block_hash.id);
    // budding.make_fragments_clickable();            
    new_insertion_point.click(function() {
      budding.place_editor_controls_at_insertion_point.click_handler($(this));
    });
    p.click(budding.ui.handlers.text_block.click);
  }
    
};

budding.update_text_block = function(text_block_id, text_block_value) {
  budding.document.body[text_block_id].text = text_block_value;
  budding.document.body[text_block_id].tag = budding.ui.current_text_block_type;
};

budding.has_text_block_changed = function() {
  if(budding.ui.text_block_selected) {
    var ta_val = $('#text-block-ta').val();
    var content_changed = budding.document.body[budding.ui.current_text_block].text != ta_val;
    var tag_changed = budding.document.body[budding.ui.current_text_block].tag != budding.ui.current_text_block_type;
    return content_changed || tag_changed;
  } else {
    return false;
  }
}

budding.save_story = function() {
  if(this.document.id != null)
    $('#editor-form').attr('action', '/documents/' + this.document.id);
  if(budding.ui.text_block_selected) {
    budding.update_text_block(budding.ui.current_text_block, $('#text-block-ta').val());
  } else if(!$('#text-block-ta').val().match(/^\s*$/)) {
    budding.add_text_block($('#text-block-ta').val());
  }
  $('#editor-form input[name=title]').val(this.document.title);
  $('#editor-form input[name=story]').val(this.document.single_string());
  $('#editor-form input[name=author]').val(this.document.author);
  $('#editor-form input[name=author_location]').val(this.document.author_location);
  $('#editor-form input[name=keywords]').val(this.document.keywords);
  $('#editor-form input[name=language]').val(this.document.language);
  $('#editor-form input[name=summary]').val(this.document.summary);
  var editor_settings = {
    use_first_paragraph_as_title: budding.ui.use_first_paragraph_as_title
  };
  console.log(JSON.stringify(editor_settings));
  $('#editor-form input[name=editor_settings]').val(JSON.stringify(editor_settings));
  $('#editor-form').submit();
};


budding.identify_tags = function(text) {
  var tag, category, box, index_of_tag;
  for(tag in budding.known_tags) {
    var index_of_tag = text.indexOf(tag);
    if(index_of_tag != -1 && !budding.identified_tags[tag]) {
      category = budding.known_tags[tag];
      var a = text.substr(0, index_of_tag);
      var content = text.substr(index_of_tag, tag.length);
      var b = text.substr(index_of_tag + tag.length);
      budding.identified_tags[tag] = true;
      text = [a, '<', category, '>', tag, '</', category, '>'].join('');
    }
  }
  return text;
};

budding.make_fragments_clickable = function() {
  var blocks = $('#text-blocks p');
  for(var i = 0, len = blocks.length; i < len; i++) {
    var block = $(blocks[i]);
    var text = $.trim(block.html());
    var fragments = [];
    var pieces = text.split(' ');
    for(var piece, fragment, j = 0, jlen = pieces.length; j < jlen; j++) {
      piece = pieces[j];
      var fragment_nontext = [];
      while(piece.charAt(piece.length-1).match(/[.,;:!?]/) && piece.length) {
        fragment_nontext.push(piece.charAt(piece.length-1));
        piece = piece.substr(0, piece.length-1);
      }
      fragment = $('<span></span>');
      fragment.attr('class', 'selectable');
      fragment.text(piece);
      fragments.push(fragment);
      if(j != jlen-1) {
        fragment_nontext.push(' ');
      }
      fragments.push($('<span></span>').text(fragment_nontext.join('')));
    }
    block.text("");
    block.append.apply(block, fragments);
  }
  $('.selectable').click(function(event) {
    if(budding.ui.shiftKey) {
      budding.ui.currentFragments.elements.push($(this));
      $(this).css('background', '#789');
      budding.ui.currentFragments.text.push($(this).text());
    } else {
      var selected_fragment = $("<span>" + $(this).text() + "</span>");
      selected_fragment.attr('class', 'selected');
      selected_fragment.draggable();
      $('#fragments-end').before(selected_fragment);
    }
  });
  $('#wikipedia-dropbox').droppable({
    drop: function(event, ui) {
      $(this).append('<br>');
      $('#wikipedia-fragments-end').before('<span class="selected" style="margin: 2px;">' + ui.draggable.text() + '</span>');
      ui.draggable.remove();
    }
  });
}

budding.place_editor_controls_at_insertion_point = function(index) {
  var insertion_point = $('#insertion-point-' + index);
  budding.place_editor_controls_at_insertion_point.click_handler(insertion_point);
}

budding.place_editor_controls_at_insertion_point.click_handler = function(context) {
  
  budding.ui.clean_up_tag_editor();
  $('#text-block-preview').hide();
  budding.ui.last_text_area_val = '';
  $('#button-raw-import').val('Add');
  $('#editor-controls').css('margin-top', '10px');
  $('#text-block-preview').css('margin-top', '5px');
  $('#text-block-preview').css('margin-bottom', '-5px');
  $('#tag-editor-box').css('margin-top', '5px');
  $('.text-block').show();
  
  context = $(context);  
  
  budding.ui.insertion_point_index = parseInt(context.id().match(/(\d+)$/)[1]);
  
  if(budding.ui.insertion_point_index == 0 && !budding.document.body[budding.ui.insertion_point_index]) {
    $('#text-block-type-p, #text-block-type-h2, #text-block-type-blockquote').attr('checked', 'false');
    $('#text-block-type-h1').attr('checked', 'true');
    $('#text-block-type-buttonset').buttonset('refresh');
    budding.ui.current_text_block_type = 'h1';
  } else {
    $('#text-block-type-h1, #text-block-type-h2, #text-block-type-blockquote').attr('checked', 'false');
    $('#text-block-type-p').attr('checked', 'true');
    $('#text-block-type-buttonset').buttonset('refresh');
    budding.ui.current_text_block_type = 'p';
  }
  var text_block_preview = $('#text-block-preview');
  var classes = ['h1', 'h2', 'p', 'blockquote'];
  for(var i = 0, len = classes.length; i < len; i++) {
    text_block_preview.removeClass('text-block-' + classes[i]);
  }
  text_block_preview.addClass('text-block-' + budding.ui.current_text_block_type);
  
  // var top_controls = $('#editor-controls-top').detach();
  // context.before(top_controls);

  if(budding.ui.text_block_selected) {
    var last_selected_text_block = $('#text-block-' + budding.ui.current_text_block);
    last_selected_text_block.removeClass('text-block-selected');
    budding.ui.text_block_selected = false;
  }
  
  $('#text-block-ta').val("");
  var editor_controls = $('#editor-controls').detach();
  context.after(editor_controls);
  var tb_preview = $('#text-block-preview').detach();
  $('#editor-controls').before(tb_preview);
  $('.insertion-point').show();
  context.hide();
  editor_controls.show();
  $('#text-block-ta').focus();

}

budding.init = function() {
  
  if(typeof budding.ui.editor_settings.use_first_paragraph_as_title != 'undefined') {
    budding.ui.use_first_paragraph_as_title = budding.ui.editor_settings.use_first_paragraph_as_title;
  }
  if(budding.ui.use_first_paragraph_as_title) {
    $('#document-title-input').attr('disabled', 'disabled');
    $('#document-title-box').addClass('editor-bar-button-selected');
  }

  this.load_known_tags();
  this.parse_text_blocks();
  budding.ui.handlers.text_block_type_select();
  budding.place_editor_controls_at_insertion_point(this.ui.insertion_point_index);
  
  $('.top-button').button();
  $('#editor-save').button();
  $('#text-block-type-buttonset').buttonset();
  $('#tag-type-buttonset').buttonset();
  $('#button-raw-import').attr('disabled', 'disabled');
  $('#text-block-type-buttonset').buttonset('refresh');
  
  $('.top-button').click(function(elem) {
    window.location = '/' + $(elem.target).attr('id').match(/button-(\w+)/)[1];
  });
  
  $('body').keydown(function(e) { 
    budding.ui.shiftKey = e.shiftKey;
  });
  
  $('body').keyup(function() { 
    if(budding.ui.shiftKey) {
      if(budding.ui.currentFragments.elements.length) {
        for(var span, i = 0, len = budding.ui.currentFragments.elements.length; i < len; i++) {
          budding.ui.currentFragments.elements[i].css('background', '#fff');
        }
        span = $("<span>" + budding.ui.currentFragments.text.join(' ') + "</span>");
        span.attr('class', 'selected');
        span.draggable();
        $('#fragments-end').before(span);
        budding.ui.currentFragments = {text: [], elements: []};
      }
      budding.ui.shiftKey = false;
    }
  });
  
  $('input[name=radio-text-block-type]').change(budding.ui.handlers.text_block_type_select);
  
  $('#text-block-ta').keypress(budding.ui.handlers.editor_textarea.keypress);
  
  $('#text-block-ta').keyup(budding.ui.handlers.editor_textarea.keyup);
  
  $('#text-block-ta').focus(function() { budding.ui.current_focus = '#text-block-ta'; });

  $('#tag-editor-input').focus(function() { budding.ui.current_focus = '#tag-editor-input'; });

  $('#tag-editor-input').keyup(budding.ui.handlers.link_editor_href_input.keyup);
  
  $('#editor-save').click(function() { 
    budding.save_story();
  });
  
  $('.insertion-point').click(function() {
    budding.place_editor_controls_at_insertion_point.click_handler($(this));
  });
  
  $('#button-raw-import').click(function() {
    var ta_val = $('#text-block-ta').val();
    if(budding.ui.text_block_selected) {
      var not_changed = !budding.has_text_block_changed();
      var empty = ta_val.match(/^\s*$/);
      if(not_changed || empty) {
        budding.place_editor_controls_at_insertion_point(budding.ui.insertion_point_index);
        return;
      }
      budding.add_text_block(ta_val);
      return;
    } else {
      var text_block, text_blocks = ta_val.replace(/\n{2,}/, '\n').split(/\n/);
      var j = 0;
      for(var i = 0, len = text_blocks.length; i < len; i++) {
        text_block = $.trim(text_blocks[i]);
        if(text_block.length) {
          budding.add_text_block(text_blocks[i]);
        }
      }
    }
  });
  
  $('#document-title-input').keyup(function() {
    budding.document.title = $(this).val();
  });
  
  $('#short-summary-textarea').keyup(function() {
    budding.document.summary = $(this).val();
  });
  
  $('#author-content input').keyup(function() {
    budding.document.author = $(this).val();
  });
  
  $('#author-location-content input').keyup(function() {
    budding.document.author_location = $(this).val();
  });

  $('#keywords-content input').keyup(function() {
    budding.document.keywords = $(this).val();
  });
  
  $('#document-title-box').click(function() {
    if(budding.ui.use_first_paragraph_as_title) {
      console.log('foo');
      $('#document-title-input').attr('disabled', '');
      $('#document-title-input').val(budding.document.title);
      budding.ui.use_first_paragraph_as_title = false;
      $(this).removeClass('editor-bar-button-selected');
    } else {
      $('#document-title-input').attr('disabled', 'disabled');
      if(budding.document.body.length) {
        $('#document-title-input').val(budding.document.body[0].text);
        budding.document.title = budding.document.body[0].text;
      }
      budding.ui.use_first_paragraph_as_title = true;
      $(this).addClass('editor-bar-button-selected');
    }
  });
  
  budding.document.language = $('#language-box-dropdown').val();
  
  $('#language-box-dropdown').change(function() {
    budding.document.language = $('#language-box-dropdown').val();
  });
  
  // $('#wordcount-content input')
  // $('#last-modified-content input')
  
}

$(document).ready(function(){
  budding.init();
});
