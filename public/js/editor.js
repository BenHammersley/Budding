
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
    currentFragments: {text: [], elements: []},
    text_block_selected: false,
    current_text_block: null,
    current_text_block_type: null,
    current_tag_editor_tag: null,
    last_text_area_val: '',
    tag_editor_links: {list: []},
    text_block_preview_hide_timeout: null,
    insertion_point_index: 0,
    handlers: {}
  },
  document: {
    body: $.extend([], {'toString': function() { 
      return $.map(this, function(elem) {
        return [elem.id, elem.text].join(':');
      }).join(',');
    }})
  },
  utils: {},
  identified_tags: {}
};

budding.ui.clean_up_tag_editor = function() {
  budding.ui.tag_editor_links = {list: []};
  budding.ui.current_tag_editor_tag = null;
  $('#tag-editor-box').hide();
  $('.editor-tag').remove();
};

budding.ui.handlers.tag_editor_input_change = function() {
  var tag_id = budding.ui.current_tag_editor_tag;
  if(tag_id != null) {
    var link = budding.ui.tag_editor_links[tag_id];
    link.href = $('#tag-editor-input').val();
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
};

budding.ui.handlers.text_block = {
  click: function() {
    $('.text-block').show();
    budding.ui.clean_up_tag_editor();
    $('.text-block').css('margin-bottom', '5px');
    $('.insertion-point').show();
    $('#button-raw-import').val('Update');
    var editor_controls = $('#editor-controls').detach();
    $(this).after(editor_controls);
    // var top_controls = $('#editor-controls-top').detach();
    // $(this).before(top_controls);
    var text_block_id = parseInt($(this).id().match(/(\d+)$/)[1]);
    // $('#text-block-ta').css('margin-top', '-10px');
    $('#text-block-' + text_block_id).hide();
    $('#editor-controls').before($('#text-block-preview').detach());
    $('#text-block-preview').show();
    $('#text-block-preview').html(budding.document.body[text_block_id].text);
    // $('#text-block-' + text_block_id).css('margin-top', '-5px');
    // $('#text-block-' + text_block_id).css('margin-bottom', '5px');
    $('#text-block-ta').val(budding.document.body[text_block_id].text);
    budding.ui.text_block_selected = true;
    budding.ui.current_text_block = text_block_id;
    $('#text-block-ta').focus();
    var content = budding.document.body[text_block_id].text;
    $('#text-block-ta')[0].setSelectionRange(content.length, content.length);
    budding.render_link_editor(text_block_id);
  }
}

budding.ui.handlers.text_block_type_select = function() { 
  var tag = $('input[name=radio-text-block-type]:checked').val();
  var text_block_preview = $('#text-block-preview');
  var classes = ['h1', 'h2', 'p', 'blockquote'];
  for(var i = 0, len = classes.length; i < len; i++) {
    text_block_preview.removeClass('text-block-' + classes[i]);
  }
  text_block_preview.addClass('text-block-' + tag);
  budding.ui.current_text_block_type = tag;
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
  return tags;
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
    
budding.utils.have_unclosed_tags = function(text) {
  // <a></a><b></b> = false
  // <a><b></b></a> = true
  // <a><b></b> = true
  var tags = text.match(/<([^/>]+)>/g);
  for(var tag in tags) {
    if(!text.match(new RegExp(tags[tag] + '[^>]*</' + tags[tag].substr(1)))) {
      return true;
    }
  }
  return false;
}

budding.load_known_tags = function() {
  $.get('/tags', function(data) {
    budding.known_tags = {};
    for(var i = 0, len = data.length; i < len; i++) {
      budding.known_tags[data[i].name] = data[i].category;
    }
  }, 'json');
}

budding.document.body.single_string = function() {
  return $.map(this, function(tb) { 
    var text_block_class = ['text-block-', tb.tag].join('');
    var text_block_start = ['<p class="', text_block_class, '">'].join('');
    var text_block_end = ['</p>'].join('');
    return [text_block_start, tb.text, text_block_end].join('');
  }).join("\n");
}

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

budding.update_live_preview = function() {
  clearTimeout(budding.ui.text_block_preview_hide_timeout);
  var ta_val = $('#text-block-ta').val();
  var multi_line_import = ta_val.split(/\n\n/).length > 1;
  if(ta_val != budding.ui.last_text_area_val && !multi_line_import) {
    if(!$('#text-block-preview').is(":visible")) {
      $('#text-block-preview').show();
    }
    $('#text-block-preview').html(ta_val);
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
    $('#text-block-' + budding.ui.current_text_block).html(text);
    var classes = ['h1', 'h2', 'p', 'blockquote'];
    for(var i = 0, len = classes.length; i < len; i++) {
      p.removeClass('text-block-' + classes[i]);
    }
    p.addClass('text-block-' + tag);
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
    budding.identify_tags(text);
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

budding.save_story = function() {
  if(this.document.id != null)
    $('#editor-form').attr('action', '/documents/' + this.document.id);
  if(budding.ui.text_block_selected) {
    budding.update_text_block(budding.ui.current_text_block, $('#text-block-ta').val());
  } else if(!$('#text-block-ta').val().match(/^\s*$/)) {
    budding.add_text_block($('#text-block-ta').val());
  }
  if(this.document.body[0].tag == 'h1') {
    $('#editor-form input[name=title]').val(this.document.body[0].text);
  }
  $('#editor-form input[name=story]').val(this.document.body.single_string());
  $('#editor-form').submit();
};


budding.identify_tags = function(text) {
  var tag, category, box;
  for(tag in budding.known_tags) {
    if(text.indexOf(tag) != -1 && !budding.identified_tags[tag]) {
      category = budding.known_tags[tag];
      box = $('#' + category + '-fragments-end');
      if(box.length) {
        box.before($('<span class="tag ui-corner-all">' + tag.replace(' ', '&nbsp;') + '</span>'));
        budding.identified_tags[tag] = true;
      }
    }
  }
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
  // $('.text-block').css('margin-bottom', '5px');
  $('#editor-controls').css('margin-bottom', '5px');
  $('.text-block').show();
  
  context = $(context);  
  
  budding.ui.insertion_point_index = parseInt(context.id().match(/(\d+)$/)[1]);
  
  console.log(budding.ui.insertion_point_index == 0 && !budding.document.body[budding.ui.insertion_point_index]);
  if(budding.ui.insertion_point_index == 0 && !budding.document.body[budding.ui.insertion_point_index]) {
    $('#text-block-type-p, #text-block-type-h2, #text-block-type-blockquote').attr('checked', 'false');
    $('#text-block-type-h1').attr('checked', 'true');
    $('#text_block_type_select').buttonset('refresh');
    budding.ui.current_text_block_type = 'h1';
  } else {
    $('#text-block-type-h1, #text-block-type-h2, #text-block-type-blockquote').attr('checked', 'false');
    $('#text-block-type-p').attr('checked', 'true');
    $('#text_block_type_select').buttonset('refresh');
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

  
  budding.load_known_tags();
  
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
  
  $('#text-block-ta').keypress(function(e) {
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
  });
  
  $('#text-block-ta').keyup(function(e) {
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
  
  $('#tag-editor-input').change(function() {
    console.log("$('#tag-editor-input').change()");
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
    }
  });

  $('input[name=radio-text-block-type]').change(budding.ui.handlers.text_block_type_select);
  
  $('#editor-save').click(function() { 
    budding.save_story();
  });
  
  $('.insertion-point').click(function() {
    $('#text-block-ta').css('margin-top', '-5px');
    budding.place_editor_controls_at_insertion_point.click_handler($(this));
  });
  
  $('#tag-editor-input').change(budding.ui.handlers.tag_editor_input_change);
  
  $('#button-raw-import').click(function() {
    var ta_val = $('#text-block-ta').val();
    if(budding.ui.text_block_selected && budding.document.body[budding.ui.current_text_block].text == ta_val) {
      return;
    } else if(ta_val.match(/^\s*$/)) {
      return;
    }
    var text_block, text_blocks = ta_val.replace(/\n{2,}/, '\n').split(/\n/);
    var j = 0;
    for(var i = 0, len = text_blocks.length; i < len; i++) {
      text_block = $.trim(text_blocks[i]);
      if(text_block.length) {
        budding.add_text_block(text_blocks[i]);
      }
    }
  });

}

$(document).ready(function(){
  budding.init();
});
