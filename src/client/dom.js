// import morphdom from "morphdom"
import Browser from './browser';
import {
  FOCUSABLE_INPUTS,
  PHX_LOADING_CLASS,
  PHX_DISABLE_WITH,
  PHX_DISABLED,
  PHX_READONLY,
  PHX_HAS_FOCUSED,
  PHX_HAS_SUBMITTED
} from './constants';

const DOM = {
  disableForm(form, prefix) {
    let disableWith = `${prefix}${PHX_DISABLE_WITH}`;
    form.classList.add(PHX_LOADING_CLASS);
    Browser.all(form, `[${disableWith}]`, el => {
      let value = el.getAttribute(disableWith);
      el.setAttribute(`${disableWith}-restore`, el.innerText);
      el.innerText = value;
    });
    Browser.all(form, 'button', button => {
      button.setAttribute(PHX_DISABLED, button.disabled);
      button.disabled = true;
    });
    Browser.all(form, 'input', input => {
      input.setAttribute(PHX_READONLY, input.readOnly);
      input.readOnly = true;
    });
  },

  restoreDisabledForm(form, prefix) {
    let disableWith = `${prefix}${PHX_DISABLE_WITH}`;
    form.classList.remove(PHX_LOADING_CLASS);
    Browser.all(form, `[${disableWith}]`, el => {
      let value = el.getAttribute(`${disableWith}-restore`);
      if (value) {
        el.innerText = value;
        el.removeAttribute(`${disableWith}-restore`);
      }
    });
    Browser.all(form, 'button', button => {
      let prev = button.getAttribute(PHX_DISABLED);
      if (prev) {
        button.disabled = prev === 'true';
        button.removeAttribute(PHX_DISABLED);
      }
    });
    Browser.all(form, 'input', input => {
      let prev = input.getAttribute(PHX_READONLY);
      if (prev) {
        input.readOnly = prev === 'true';
        input.removeAttribute(PHX_READONLY);
      }
    });
  },

  discardError(el) {
    let field = el.getAttribute && el.getAttribute(PHX_ERROR_FOR);
    if (!field) {
      return;
    }
    let input = document.getElementById(field);

    if (
      field &&
      !(
        input.getAttribute(PHX_HAS_FOCUSED) ||
        input.form.getAttribute(PHX_HAS_SUBMITTED)
      )
    ) {
      el.style.display = 'none';
    }
  },

  // isPhxChild(node){
  //   return node.getAttribute && node.getAttribute(PHX_PARENT_ID)
  // },

  isIgnored(el, phxIgnore) {
    return (
      (el.getAttribute && el.getAttribute(phxIgnore) != null) ||
      (el.parentNode && el.parentNode.getAttribute(phxIgnore) != null)
    );
  },

  // patch(view, container, id, html){
  //   let focused = view.liveSocket.getActiveElement()
  //   let selectionStart = null
  //   let selectionEnd = null
  //   let phxIgnore = view.liveSocket.binding("ignore")

  //   if(DOM.isTextualInput(focused)){
  //     selectionStart = focused.selectionStart
  //     selectionEnd = focused.selectionEnd
  //   }

  //   morphdom(container, `<div>${html}</div>`, {
  //     childrenOnly: true,
  //     onBeforeNodeAdded: function(el){
  //       //input handling
  //       DOM.discardError(el)
  //       return el
  //     },
  //     onNodeAdded: function(el){
  //       // nested view handling
  //       if(DOM.isPhxChild(el) && view.ownsElement(el)){
  //         view.onNewChildAdded()
  //         return true
  //       }
  //     },
  //     onBeforeNodeDiscarded: function(el){
  //       if(DOM.isIgnored(el, phxIgnore)){ return false }
  //       // nested view handling
  //       if(DOM.isPhxChild(el)){
  //         view.liveSocket.destroyViewById(el.id)
  //         return true
  //       }
  //     },
  //     onBeforeElUpdated: function(fromEl, toEl) {
  //       if(DOM.isIgnored(fromEl, phxIgnore)){ return false }
  //       // nested view handling
  //       if(DOM.isPhxChild(toEl)){
  //         let prevStatic = fromEl.getAttribute(PHX_STATIC)

  //         if(!Session.isEqual(toEl, fromEl)){
  //           view.liveSocket.destroyViewById(fromEl.id)
  //           view.onNewChildAdded()
  //         }
  //         DOM.mergeAttrs(fromEl, toEl)
  //         fromEl.setAttribute(PHX_STATIC, prevStatic)
  //         return false
  //       }

  //       // input handling
  //       if(fromEl.getAttribute && fromEl.getAttribute(PHX_HAS_SUBMITTED)){
  //         toEl.setAttribute(PHX_HAS_SUBMITTED, true)
  //       }
  //       if(fromEl.getAttribute && fromEl.getAttribute(PHX_HAS_FOCUSED)){
  //         toEl.setAttribute(PHX_HAS_FOCUSED, true)
  //       }
  //       DOM.discardError(toEl)

  //       if(DOM.isTextualInput(fromEl) && fromEl === focused){
  //         DOM.mergeInputs(fromEl, toEl)
  //         return false
  //       } else {
  //         return true
  //       }
  //     }
  //   })

  //   view.liveSocket.silenceEvents(() => {
  //     DOM.restoreFocus(focused, selectionStart, selectionEnd)
  //   })
  //   Browser.dispatchEvent(document, "phx:update")
  // },

  mergeAttrs(target, source) {
    var attrs = source.attributes;
    for (let i = 0, length = attrs.length; i < length; i++) {
      let name = attrs[i].name;
      let value = source.getAttribute(name);
      target.setAttribute(name, value);
    }
  },

  mergeInputs(target, source) {
    DOM.mergeAttrs(target, source);
    target.readOnly = source.readOnly;
  },

  restoreFocus(focused, selectionStart, selectionEnd) {
    if (!DOM.isTextualInput(focused)) {
      return;
    }
    if (focused.value === '' || focused.readOnly) {
      focused.blur();
    }
    focused.focus();
    if (
      (focused.setSelectionRange && focused.type === 'text') ||
      focused.type === 'textarea'
    ) {
      focused.setSelectionRange(selectionStart, selectionEnd);
    }
  },

  isTextualInput(el) {
    return FOCUSABLE_INPUTS.indexOf(el.type) >= 0;
  }
};

export default DOM;
