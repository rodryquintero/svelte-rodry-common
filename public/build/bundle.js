
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.34.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\Modal\index.svelte generated by Svelte v3.34.0 */

    const file$a = "src\\Modal\\index.svelte";
    const get_footer_slot_changes = dirty => ({});
    const get_footer_slot_context = ctx => ({});
    const get_body_slot_changes = dirty => ({});
    const get_body_slot_context = ctx => ({});
    const get_title_slot_changes = dirty => ({});
    const get_title_slot_context = ctx => ({});

    // (12:0) {#if show}
    function create_if_block$3(ctx) {
    	let div9;
    	let div1;
    	let div0;
    	let t0;
    	let div8;
    	let div5;
    	let div4;
    	let div2;
    	let t1;
    	let div3;
    	let span;
    	let t3;
    	let div6;
    	let t4;
    	let div7;
    	let div8_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const title_slot_template = /*#slots*/ ctx[5].title;
    	const title_slot = create_slot(title_slot_template, ctx, /*$$scope*/ ctx[4], get_title_slot_context);
    	const body_slot_template = /*#slots*/ ctx[5].body;
    	const body_slot = create_slot(body_slot_template, ctx, /*$$scope*/ ctx[4], get_body_slot_context);
    	const footer_slot_template = /*#slots*/ ctx[5].footer;
    	const footer_slot = create_slot(footer_slot_template, ctx, /*$$scope*/ ctx[4], get_footer_slot_context);

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div8 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			div2 = element("div");
    			if (title_slot) title_slot.c();
    			t1 = space();
    			div3 = element("div");
    			span = element("span");
    			span.textContent = "X";
    			t3 = space();
    			div6 = element("div");
    			if (body_slot) body_slot.c();
    			t4 = space();
    			div7 = element("div");
    			if (footer_slot) footer_slot.c();
    			attr_dev(div0, "class", "absolute inset-0 bg-gray-500 opacity-75");
    			add_location(div0, file$a, 17, 6, 388);
    			attr_dev(div1, "class", "fixed inset-0 transition-opacity");
    			add_location(div1, file$a, 16, 4, 334);
    			attr_dev(div2, "class", "w-11/12");
    			add_location(div2, file$a, 31, 10, 792);
    			attr_dev(span, "class", "close svelte-1stvsba");
    			add_location(span, file$a, 37, 12, 968);
    			attr_dev(div3, "class", "w-1/12 text-right close svelte-1stvsba");
    			add_location(div3, file$a, 36, 10, 917);
    			attr_dev(div4, "class", "flex");
    			add_location(div4, file$a, 30, 8, 762);
    			attr_dev(div5, "class", "bg-white px-4 pt-3");
    			add_location(div5, file$a, 28, 6, 697);
    			attr_dev(div6, "class", "bg-white px-4 pt-3 pb-3");
    			add_location(div6, file$a, 43, 6, 1091);
    			attr_dev(div7, "class", "bg-gray-300 px-4 py-3");
    			add_location(div7, file$a, 49, 6, 1228);

    			attr_dev(div8, "class", div8_class_value = "" + (null_to_empty(`bg-white rounded-lg overflow-hidden shadow-xl transform
      transition-all ${/*cssClass*/ ctx[1]}`) + " svelte-1stvsba"));

    			attr_dev(div8, "role", "dialog");
    			attr_dev(div8, "aria-modal", "true");
    			attr_dev(div8, "aria-labelledby", "modal-headline");
    			add_location(div8, file$a, 20, 4, 463);
    			set_style(div9, "z-index", "2000");
    			attr_dev(div9, "class", "fixed bottom-0 inset-x-0 px-4 pb-4 sm:inset-0 sm:flex sm:items-center\r\n    sm:justify-center");
    			add_location(div9, file$a, 12, 2, 191);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div1);
    			append_dev(div1, div0);
    			append_dev(div9, t0);
    			append_dev(div9, div8);
    			append_dev(div8, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div2);

    			if (title_slot) {
    				title_slot.m(div2, null);
    			}

    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			append_dev(div3, span);
    			append_dev(div8, t3);
    			append_dev(div8, div6);

    			if (body_slot) {
    				body_slot.m(div6, null);
    			}

    			append_dev(div8, t4);
    			append_dev(div8, div7);

    			if (footer_slot) {
    				footer_slot.m(div7, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*hide*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (title_slot) {
    				if (title_slot.p && dirty & /*$$scope*/ 16) {
    					update_slot(title_slot, title_slot_template, ctx, /*$$scope*/ ctx[4], dirty, get_title_slot_changes, get_title_slot_context);
    				}
    			}

    			if (body_slot) {
    				if (body_slot.p && dirty & /*$$scope*/ 16) {
    					update_slot(body_slot, body_slot_template, ctx, /*$$scope*/ ctx[4], dirty, get_body_slot_changes, get_body_slot_context);
    				}
    			}

    			if (footer_slot) {
    				if (footer_slot.p && dirty & /*$$scope*/ 16) {
    					update_slot(footer_slot, footer_slot_template, ctx, /*$$scope*/ ctx[4], dirty, get_footer_slot_changes, get_footer_slot_context);
    				}
    			}

    			if (!current || dirty & /*cssClass*/ 2 && div8_class_value !== (div8_class_value = "" + (null_to_empty(`bg-white rounded-lg overflow-hidden shadow-xl transform
      transition-all ${/*cssClass*/ ctx[1]}`) + " svelte-1stvsba"))) {
    				attr_dev(div8, "class", div8_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title_slot, local);
    			transition_in(body_slot, local);
    			transition_in(footer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title_slot, local);
    			transition_out(body_slot, local);
    			transition_out(footer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    			if (title_slot) title_slot.d(detaching);
    			if (body_slot) body_slot.d(detaching);
    			if (footer_slot) footer_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(12:0) {#if show}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*show*/ ctx[0] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*show*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*show*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Modal", slots, ['title','body','footer']);
    	let { show = false } = $$props;
    	let { cssClass = "" } = $$props;

    	let { onClose = () => {
    		
    	} } = $$props;

    	function hide() {
    		$$invalidate(0, show = false);
    		onClose();
    	}

    	const writable_props = ["show", "cssClass", "onClose"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("show" in $$props) $$invalidate(0, show = $$props.show);
    		if ("cssClass" in $$props) $$invalidate(1, cssClass = $$props.cssClass);
    		if ("onClose" in $$props) $$invalidate(3, onClose = $$props.onClose);
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ show, cssClass, onClose, hide });

    	$$self.$inject_state = $$props => {
    		if ("show" in $$props) $$invalidate(0, show = $$props.show);
    		if ("cssClass" in $$props) $$invalidate(1, cssClass = $$props.cssClass);
    		if ("onClose" in $$props) $$invalidate(3, onClose = $$props.onClose);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [show, cssClass, hide, onClose, $$scope, slots];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { show: 0, cssClass: 1, onClose: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get show() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set show(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cssClass() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cssClass(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClose() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClose(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const initialState = {
      currentUrl: window.location.hash,
    };

    const store = writable(initialState);

    /* src\Treeview\Item.svelte generated by Svelte v3.34.0 */
    const file$9 = "src\\Treeview\\Item.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (25:0) {:else}
    function create_else_block_1(ctx) {
    	let a;
    	let t_value = /*item*/ ctx[0].title + "";
    	let t;
    	let a_title_value;
    	let a_href_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "class", "icon svelte-11zf6t5");
    			attr_dev(a, "title", a_title_value = `${/*item*/ ctx[0].title}`);
    			attr_dev(a, "href", a_href_value = `${/*item*/ ctx[0].url}`);
    			toggle_class(a, "active", /*$store*/ ctx[5].currentUrl == /*item*/ ctx[0].url);
    			add_location(a, file$9, 25, 2, 486);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*item*/ 1 && t_value !== (t_value = /*item*/ ctx[0].title + "")) set_data_dev(t, t_value);

    			if (dirty & /*item*/ 1 && a_title_value !== (a_title_value = `${/*item*/ ctx[0].title}`)) {
    				attr_dev(a, "title", a_title_value);
    			}

    			if (dirty & /*item*/ 1 && a_href_value !== (a_href_value = `${/*item*/ ctx[0].url}`)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*$store, item*/ 33) {
    				toggle_class(a, "active", /*$store*/ ctx[5].currentUrl == /*item*/ ctx[0].url);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(25:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (17:0) {#if children}
    function create_if_block_1(ctx) {
    	let span;
    	let t0;
    	let t1;
    	let span_title_value;
    	let mounted;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (/*showChildren*/ ctx[2]) return create_if_block_2;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if_block.c();
    			t0 = space();
    			t1 = text(/*title*/ ctx[3]);
    			attr_dev(span, "class", "icon svelte-11zf6t5");
    			attr_dev(span, "title", span_title_value = `${/*title*/ ctx[3]}`);
    			add_location(span, file$9, 17, 2, 315);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			if_block.m(span, null);
    			append_dev(span, t0);
    			append_dev(span, t1);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*toggleChildren*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type_1(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(span, t0);
    				}
    			}

    			if (dirty & /*title*/ 8) set_data_dev(t1, /*title*/ ctx[3]);

    			if (dirty & /*title*/ 8 && span_title_value !== (span_title_value = `${/*title*/ ctx[3]}`)) {
    				attr_dev(span, "title", span_title_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(17:0) {#if children}",
    		ctx
    	});

    	return block;
    }

    // (21:4) {:else}
    function create_else_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("►");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(21:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (19:4) {#if showChildren}
    function create_if_block_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("▼");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(19:4) {#if showChildren}",
    		ctx
    	});

    	return block;
    }

    // (35:0) {#if showChildren}
    function create_if_block$2(ctx) {
    	let ul;
    	let current;
    	let each_value = /*children*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-11zf6t5");
    			add_location(ul, file$9, 35, 2, 705);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*children, onClick*/ 18) {
    				each_value = /*children*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(35:0) {#if showChildren}",
    		ctx
    	});

    	return block;
    }

    // (37:4) {#each children as child}
    function create_each_block$4(ctx) {
    	let li;
    	let item_1;
    	let t;
    	let current;

    	item_1 = new Item({
    			props: {
    				item: /*child*/ ctx[8],
    				onClick: /*onClick*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(item_1.$$.fragment);
    			t = space();
    			attr_dev(li, "class", "child svelte-11zf6t5");
    			add_location(li, file$9, 37, 6, 748);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(item_1, li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const item_1_changes = {};
    			if (dirty & /*children*/ 16) item_1_changes.item = /*child*/ ctx[8];
    			if (dirty & /*onClick*/ 2) item_1_changes.onClick = /*onClick*/ ctx[1];
    			item_1.$set(item_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(item_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(item_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(item_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(37:4) {#each children as child}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;

    	function select_block_type(ctx, dirty) {
    		if (/*children*/ ctx[4]) return create_if_block_1;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*showChildren*/ ctx[2] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			}

    			if (/*showChildren*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*showChildren*/ 4) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let title;
    	let children;
    	let $store;
    	validate_store(store, "store");
    	component_subscribe($$self, store, $$value => $$invalidate(5, $store = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Item", slots, []);
    	let { item = {} } = $$props;

    	let { onClick = (e, item) => {
    		
    	} } = $$props;

    	let showChildren = false;

    	const toggleChildren = () => {
    		$$invalidate(2, showChildren = !showChildren);
    	};

    	const writable_props = ["item", "onClick"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Item> was created with unknown prop '${key}'`);
    	});

    	const click_handler = e => onClick(e, item);

    	$$self.$$set = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    		if ("onClick" in $$props) $$invalidate(1, onClick = $$props.onClick);
    	};

    	$$self.$capture_state = () => ({
    		store,
    		item,
    		onClick,
    		showChildren,
    		toggleChildren,
    		title,
    		children,
    		$store
    	});

    	$$self.$inject_state = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    		if ("onClick" in $$props) $$invalidate(1, onClick = $$props.onClick);
    		if ("showChildren" in $$props) $$invalidate(2, showChildren = $$props.showChildren);
    		if ("title" in $$props) $$invalidate(3, title = $$props.title);
    		if ("children" in $$props) $$invalidate(4, children = $$props.children);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*item*/ 1) {
    			$$invalidate(3, title = item.title);
    		}

    		if ($$self.$$.dirty & /*item*/ 1) {
    			$$invalidate(4, children = item.children);
    		}
    	};

    	return [
    		item,
    		onClick,
    		showChildren,
    		title,
    		children,
    		$store,
    		toggleChildren,
    		click_handler
    	];
    }

    class Item extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { item: 0, onClick: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Item",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get item() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClick() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClick(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Treeview\index.svelte generated by Svelte v3.34.0 */
    const file$8 = "src\\Treeview\\index.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (23:2) {#each items as item}
    function create_each_block$3(ctx) {
    	let li;
    	let item;
    	let t;
    	let current;

    	item = new Item({
    			props: {
    				item: /*item*/ ctx[4],
    				onClick: /*onClick*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(item.$$.fragment);
    			t = space();
    			attr_dev(li, "class", "svelte-56obm");
    			add_location(li, file$8, 23, 4, 505);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(item, li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const item_changes = {};
    			if (dirty & /*items*/ 1) item_changes.item = /*item*/ ctx[4];
    			if (dirty & /*onClick*/ 2) item_changes.onClick = /*onClick*/ ctx[1];
    			item.$set(item_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(item.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(item.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(item);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(23:2) {#each items as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let ul;
    	let current;
    	let each_value = /*items*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "svelte-56obm");
    			add_location(ul, file$8, 21, 0, 470);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*items, onClick*/ 3) {
    				each_value = /*items*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $store;
    	validate_store(store, "store");
    	component_subscribe($$self, store, $$value => $$invalidate(2, $store = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Treeview", slots, []);
    	let { items = [] } = $$props;

    	let { onClick = () => {
    		
    	} } = $$props;

    	const onHashChange = () => {
    		set_store_value(store, $store.currentUrl = window.location.hash, $store);
    	};

    	onMount(() => {
    		window.addEventListener("hashchange", onHashChange);
    	});

    	onDestroy(() => {
    		window.removeEventListener("hashchange", onHashChange);
    	});

    	const writable_props = ["items", "onClick"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Treeview> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("items" in $$props) $$invalidate(0, items = $$props.items);
    		if ("onClick" in $$props) $$invalidate(1, onClick = $$props.onClick);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		store,
    		Item,
    		items,
    		onClick,
    		onHashChange,
    		$store
    	});

    	$$self.$inject_state = $$props => {
    		if ("items" in $$props) $$invalidate(0, items = $$props.items);
    		if ("onClick" in $$props) $$invalidate(1, onClick = $$props.onClick);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [items, onClick];
    }

    class Treeview extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { items: 0, onClick: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Treeview",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get items() {
    		throw new Error("<Treeview>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Treeview>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClick() {
    		throw new Error("<Treeview>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClick(value) {
    		throw new Error("<Treeview>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\MultiSelect\index.svelte generated by Svelte v3.34.0 */
    const file$7 = "src\\MultiSelect\\index.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    // (91:4) {#each value as val}
    function create_each_block_1(ctx) {
    	let span;
    	let t_value = /*val*/ ctx[19] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "" + (null_to_empty(`value ${/*className*/ ctx[6]}`) + " svelte-wsm0x7"));
    			add_location(span, file$7, 91, 6, 2053);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*value*/ 1 && t_value !== (t_value = /*val*/ ctx[19] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(91:4) {#each value as val}",
    		ctx
    	});

    	return block;
    }

    // (97:2) {#if show}
    function create_if_block$1(ctx) {
    	let div1;
    	let label0;
    	let input0;
    	let t0;
    	let div0;
    	let label1;
    	let input1;
    	let t1;
    	let small;
    	let t3;
    	let mounted;
    	let dispose;
    	let each_value = /*displayItems*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			label0 = element("label");
    			input0 = element("input");
    			t0 = space();
    			div0 = element("div");
    			label1 = element("label");
    			input1 = element("input");
    			t1 = space();
    			small = element("small");
    			small.textContent = "Select all";
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(input0, "placeholder", "filter");
    			attr_dev(input0, "autocomplete", "off");
    			attr_dev(input0, "id", "filter");
    			attr_dev(input0, "type", "search");
    			attr_dev(input0, "class", "filter svelte-wsm0x7");
    			add_location(input0, file$7, 100, 8, 2334);
    			attr_dev(label0, "for", "filter");
    			attr_dev(label0, "class", "svelte-wsm0x7");
    			add_location(label0, file$7, 99, 6, 2304);
    			attr_dev(input1, "id", "select-all");
    			attr_dev(input1, "type", "checkbox");
    			input1.checked = /*selectAll*/ ctx[7];
    			add_location(input1, file$7, 113, 10, 2696);
    			attr_dev(small, "class", "svelte-wsm0x7");
    			add_location(small, file$7, 119, 10, 2860);
    			attr_dev(label1, "for", "select-all");
    			attr_dev(label1, "class", "svelte-wsm0x7");
    			add_location(label1, file$7, 112, 8, 2660);
    			attr_dev(div0, "class", "" + (null_to_empty(`list-actions ${/*className*/ ctx[6]}`) + " svelte-wsm0x7"));
    			add_location(div0, file$7, 110, 6, 2580);
    			attr_dev(div1, "class", "" + (null_to_empty(`${/*className*/ ctx[6]} dropdown-content`) + " svelte-wsm0x7"));
    			add_location(div1, file$7, 97, 4, 2224);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, label0);
    			append_dev(label0, input0);
    			set_input_value(input0, /*filter*/ ctx[2]);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, label1);
    			append_dev(label1, input1);
    			append_dev(label1, t1);
    			append_dev(label1, small);
    			append_dev(div1, t3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[13]),
    					listen_dev(input1, "change", /*toggleSelectAll*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*filter*/ 4) {
    				set_input_value(input0, /*filter*/ ctx[2]);
    			}

    			if (dirty & /*className, displayItems, value, name, toggleCheck*/ 1099) {
    				each_value = /*displayItems*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(97:2) {#if show}",
    		ctx
    	});

    	return block;
    }

    // (134:6) {#each displayItems as item}
    function create_each_block$2(ctx) {
    	let label;
    	let input;
    	let input_checked_value;
    	let input_value_value;
    	let input_id_value;
    	let t0;
    	let t1_value = /*item*/ ctx[16] + "";
    	let t1;
    	let t2;
    	let label_for_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(input, "class", "" + (null_to_empty(`${/*className*/ ctx[6]}`) + " svelte-wsm0x7"));
    			input.checked = input_checked_value = /*value*/ ctx[0].indexOf(/*item*/ ctx[16]) != -1;
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "name", /*name*/ ctx[1]);
    			input.value = input_value_value = /*item*/ ctx[16];
    			attr_dev(input, "id", input_id_value = `${/*item*/ ctx[16]}`);
    			add_location(input, file$7, 135, 10, 3327);
    			attr_dev(label, "class", "" + (null_to_empty(`menu-item ${/*className*/ ctx[6]}`) + " svelte-wsm0x7"));
    			attr_dev(label, "for", label_for_value = `${/*item*/ ctx[16]}`);
    			add_location(label, file$7, 134, 8, 3259);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(label, t2);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*toggleCheck*/ ctx[10], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*value, displayItems*/ 9 && input_checked_value !== (input_checked_value = /*value*/ ctx[0].indexOf(/*item*/ ctx[16]) != -1)) {
    				prop_dev(input, "checked", input_checked_value);
    			}

    			if (dirty & /*name*/ 2) {
    				attr_dev(input, "name", /*name*/ ctx[1]);
    			}

    			if (dirty & /*displayItems*/ 8 && input_value_value !== (input_value_value = /*item*/ ctx[16])) {
    				prop_dev(input, "value", input_value_value);
    			}

    			if (dirty & /*displayItems*/ 8 && input_id_value !== (input_id_value = `${/*item*/ ctx[16]}`)) {
    				attr_dev(input, "id", input_id_value);
    			}

    			if (dirty & /*displayItems*/ 8 && t1_value !== (t1_value = /*item*/ ctx[16] + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*displayItems*/ 8 && label_for_value !== (label_for_value = `${/*item*/ ctx[16]}`)) {
    				attr_dev(label, "for", label_for_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(134:6) {#each displayItems as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div;
    	let button;
    	let span;
    	let t0;
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*value*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let if_block = /*show*/ ctx[4] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			span = element("span");
    			t0 = text("▼");
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			if (if_block) if_block.c();
    			attr_dev(span, "class", "" + (null_to_empty(`${/*className*/ ctx[6]}`) + " svelte-wsm0x7"));
    			set_style(span, "margin-left", "2px");
    			add_location(span, file$7, 89, 4, 1951);
    			attr_dev(button, "class", "" + (null_to_empty(`dropbtn ${/*className*/ ctx[6]}`) + " svelte-wsm0x7"));
    			attr_dev(button, "title", /*itemsTooltip*/ ctx[5]);
    			toggle_class(button, "menu-open", /*show*/ ctx[4]);
    			add_location(button, file$7, 83, 2, 1819);
    			attr_dev(div, "class", "" + (null_to_empty(`${/*className*/ ctx[6]} dropdown`) + " svelte-wsm0x7"));
    			add_location(div, file$7, 82, 0, 1778);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(button, span);
    			append_dev(span, t0);
    			append_dev(button, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(button, null);
    			}

    			append_dev(div, t2);
    			if (if_block) if_block.m(div, null);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*trigger*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*className, value*/ 65) {
    				each_value_1 = /*value*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(button, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty & /*itemsTooltip*/ 32) {
    				attr_dev(button, "title", /*itemsTooltip*/ ctx[5]);
    			}

    			if (dirty & /*show*/ 16) {
    				toggle_class(button, "menu-open", /*show*/ ctx[4]);
    			}

    			if (/*show*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let itemsTooltip;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MultiSelect", slots, []);
    	let { items = [] } = $$props;
    	let { value = [] } = $$props;
    	let { name = "" } = $$props;

    	let { onChange = () => {
    		
    	} } = $$props;

    	const className = `dropdown-${Date.now()}-${Math.random() * 100}`;

    	const onClickOutside = e => {
    		if (!e.target.className.includes(className)) {
    			$$invalidate(4, show = false);
    		}
    	};

    	onMount(() => {
    		window.addEventListener("click", onClickOutside);
    	});

    	onDestroy(() => {
    		window.removeEventListener("click", onClickOutside);
    	});

    	let filter = "";
    	let show = false;
    	let showChecked = false;
    	let selectAll = value.length == items.length ? true : false;

    	// $: selectTotal = value.length;
    	let displayItems = [];

    	// METHODS
    	// =======================================================
    	const trigger = () => {
    		$$invalidate(4, show = !show);
    	};

    	const toggleSelectAll = e => {
    		const { checked } = e.target;

    		if (checked) {
    			$$invalidate(0, value = displayItems);
    		} else {
    			$$invalidate(0, value = []);
    		}

    		onChange(value);
    	};

    	// const toggleShowChecked = (e) => {
    	//   const { checked } = e.target;
    	//   showChecked = checked;
    	// };
    	const toggleCheck = e => {
    		const { checked } = e.target;

    		if (checked) {
    			$$invalidate(0, value = [...value, e.target.value]);
    		} else {
    			$$invalidate(0, value = value.filter(d => d != e.target.value));
    		}

    		onChange(value);
    	};

    	const writable_props = ["items", "value", "name", "onChange"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MultiSelect> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		filter = this.value;
    		$$invalidate(2, filter);
    	}

    	$$self.$$set = $$props => {
    		if ("items" in $$props) $$invalidate(11, items = $$props.items);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("onChange" in $$props) $$invalidate(12, onChange = $$props.onChange);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		items,
    		value,
    		name,
    		onChange,
    		className,
    		onClickOutside,
    		filter,
    		show,
    		showChecked,
    		selectAll,
    		displayItems,
    		trigger,
    		toggleSelectAll,
    		toggleCheck,
    		itemsTooltip
    	});

    	$$self.$inject_state = $$props => {
    		if ("items" in $$props) $$invalidate(11, items = $$props.items);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("onChange" in $$props) $$invalidate(12, onChange = $$props.onChange);
    		if ("filter" in $$props) $$invalidate(2, filter = $$props.filter);
    		if ("show" in $$props) $$invalidate(4, show = $$props.show);
    		if ("showChecked" in $$props) $$invalidate(15, showChecked = $$props.showChecked);
    		if ("selectAll" in $$props) $$invalidate(7, selectAll = $$props.selectAll);
    		if ("displayItems" in $$props) $$invalidate(3, displayItems = $$props.displayItems);
    		if ("itemsTooltip" in $$props) $$invalidate(5, itemsTooltip = $$props.itemsTooltip);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 1) {
    			$$invalidate(5, itemsTooltip = value.length ? value.join(",") : "");
    		}

    		if ($$self.$$.dirty & /*filter, items, displayItems, value*/ 2061) {
    			{
    				$$invalidate(3, displayItems = !filter
    				? items
    				: items.filter(d => {
    						return d.toLowerCase().indexOf(filter.toLowerCase()) != -1;
    					}));

    				if (showChecked) {
    					$$invalidate(3, displayItems = displayItems.filter(d => value.indexOf(d) != -1));
    				}
    			}
    		}
    	};

    	return [
    		value,
    		name,
    		filter,
    		displayItems,
    		show,
    		itemsTooltip,
    		className,
    		selectAll,
    		trigger,
    		toggleSelectAll,
    		toggleCheck,
    		items,
    		onChange,
    		input0_input_handler
    	];
    }

    class MultiSelect extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			items: 11,
    			value: 0,
    			name: 1,
    			onChange: 12
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MultiSelect",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get items() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onChange() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onChange(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Breadcrumbs\index.svelte generated by Svelte v3.34.0 */
    const file$6 = "src\\Breadcrumbs\\index.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (22:2) {#each items as item}
    function create_each_block$1(ctx) {
    	let li;
    	let a;
    	let t0_value = /*item*/ ctx[4].label + "";
    	let t0;
    	let a_href_value;
    	let t1;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(a, "href", a_href_value = /*item*/ ctx[4].url);
    			add_location(a, file$6, 23, 6, 538);
    			attr_dev(li, "class", "svelte-h7f8jb");
    			toggle_class(li, "active", /*item*/ ctx[4].url == /*currentUrl*/ ctx[2]);
    			add_location(li, file$6, 22, 4, 488);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t0);
    			append_dev(li, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*items*/ 1 && t0_value !== (t0_value = /*item*/ ctx[4].label + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*items*/ 1 && a_href_value !== (a_href_value = /*item*/ ctx[4].url)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*items, currentUrl*/ 5) {
    				toggle_class(li, "active", /*item*/ ctx[4].url == /*currentUrl*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(22:2) {#each items as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let ul;
    	let each_value = /*items*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "breadcrumb svelte-h7f8jb");
    			attr_dev(ul, "style", /*style*/ ctx[1]);
    			add_location(ul, file$6, 20, 0, 426);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*items, currentUrl*/ 5) {
    				each_value = /*items*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*style*/ 2) {
    				attr_dev(ul, "style", /*style*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Breadcrumbs", slots, []);
    	let { items = [] } = $$props;
    	let { style = "" } = $$props;
    	let currentUrl = window.location.hash;

    	const onHashChange = () => {
    		$$invalidate(2, currentUrl = window.location.hash);
    	};

    	onMount(() => {
    		window.addEventListener("hashchange", onHashChange);
    	});

    	onDestroy(() => {
    		window.removeEventListener("hashchange", onHashChange);
    	});

    	const writable_props = ["items", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Breadcrumbs> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("items" in $$props) $$invalidate(0, items = $$props.items);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		items,
    		style,
    		currentUrl,
    		onHashChange
    	});

    	$$self.$inject_state = $$props => {
    		if ("items" in $$props) $$invalidate(0, items = $$props.items);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    		if ("currentUrl" in $$props) $$invalidate(2, currentUrl = $$props.currentUrl);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [items, style, currentUrl];
    }

    class Breadcrumbs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { items: 0, style: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Breadcrumbs",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get items() {
    		throw new Error("<Breadcrumbs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Breadcrumbs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Breadcrumbs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Breadcrumbs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    let id = 1;

    function getId() {
      return `svelte-tabs-${id++}`;
    }

    /* src\SvelteTabs\Tabs.svelte generated by Svelte v3.34.0 */
    const file$5 = "src\\SvelteTabs\\Tabs.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "svelte-tabs");
    			add_location(div, file$5, 102, 0, 2542);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "keydown", /*handleKeyDown*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const TABS = {};

    function removeAndUpdateSelected(arr, item, selectedStore) {
    	const index = arr.indexOf(item);
    	arr.splice(index, 1);

    	selectedStore.update(selected => selected === item
    	? arr[index] || arr[arr.length - 1]
    	: selected);
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $selectedTab;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tabs", slots, ['default']);
    	let { selectedTabIndex = 0 } = $$props;
    	const tabElements = [];
    	const tabs = [];
    	const panels = [];
    	const controls = writable({});
    	const labeledBy = writable({});
    	const selectedTab = writable(null);
    	validate_store(selectedTab, "selectedTab");
    	component_subscribe($$self, selectedTab, value => $$invalidate(5, $selectedTab = value));
    	const selectedPanel = writable(null);

    	function registerItem(arr, item, selectedStore) {
    		arr.push(item);
    		selectedStore.update(selected => selected || item);
    		onDestroy(() => removeAndUpdateSelected(arr, item, selectedStore));
    	}

    	function selectTab(tab) {
    		$$invalidate(2, selectedTabIndex = tabs.indexOf(tab));
    		selectedTab.set(tab);
    		selectedPanel.set(panels[selectedTabIndex]);
    	}

    	setContext(TABS, {
    		registerTab(tab) {
    			registerItem(tabs, tab, selectedTab);
    		},
    		registerTabElement(tabElement) {
    			tabElements.push(tabElement);
    		},
    		registerPanel(panel) {
    			registerItem(panels, panel, selectedPanel);
    		},
    		selectTab,
    		selectedTab,
    		selectedPanel,
    		controls,
    		labeledBy
    	});

    	onMount(() => {
    		selectTab(tabs[selectedTabIndex]);
    	});

    	afterUpdate(() => {
    		for (let i = 0; i < tabs.length; i++) {
    			controls.update(controlsData => ({
    				...controlsData,
    				[tabs[i].id]: panels[i].id
    			}));

    			labeledBy.update(labeledByData => ({
    				...labeledByData,
    				[panels[i].id]: tabs[i].id
    			}));
    		}
    	});

    	async function handleKeyDown(event) {
    		if (event.target.classList.contains("svelte-tabs__tab")) {
    			let selectedIndex = tabs.indexOf($selectedTab);

    			switch (event.key) {
    				case "ArrowRight":
    					selectedIndex += 1;
    					if (selectedIndex > tabs.length - 1) {
    						selectedIndex = 0;
    					}
    					selectTab(tabs[selectedIndex]);
    					tabElements[selectedIndex].focus();
    					break;
    				case "ArrowLeft":
    					selectedIndex -= 1;
    					if (selectedIndex < 0) {
    						selectedIndex = tabs.length - 1;
    					}
    					selectTab(tabs[selectedIndex]);
    					tabElements[selectedIndex].focus();
    			}
    		}
    	}

    	const writable_props = ["selectedTabIndex"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tabs> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("selectedTabIndex" in $$props) $$invalidate(2, selectedTabIndex = $$props.selectedTabIndex);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		TABS,
    		afterUpdate,
    		setContext,
    		onDestroy,
    		onMount,
    		tick,
    		writable,
    		selectedTabIndex,
    		tabElements,
    		tabs,
    		panels,
    		controls,
    		labeledBy,
    		selectedTab,
    		selectedPanel,
    		removeAndUpdateSelected,
    		registerItem,
    		selectTab,
    		handleKeyDown,
    		$selectedTab
    	});

    	$$self.$inject_state = $$props => {
    		if ("selectedTabIndex" in $$props) $$invalidate(2, selectedTabIndex = $$props.selectedTabIndex);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*selectedTabIndex*/ 4) ;
    	};

    	return [selectedTab, handleKeyDown, selectedTabIndex, $$scope, slots];
    }

    class Tabs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { selectedTabIndex: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tabs",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get selectedTabIndex() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedTabIndex(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\SvelteTabs\Tab.svelte generated by Svelte v3.34.0 */
    const file$4 = "src\\SvelteTabs\\Tab.svelte";

    function create_fragment$4(ctx) {
    	let li;
    	let li_aria_controls_value;
    	let li_tabindex_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			li = element("li");
    			if (default_slot) default_slot.c();
    			attr_dev(li, "role", "tab");
    			attr_dev(li, "id", /*tab*/ ctx[3].id);
    			attr_dev(li, "aria-controls", li_aria_controls_value = /*$controls*/ ctx[2][/*tab*/ ctx[3].id]);
    			attr_dev(li, "aria-selected", /*isSelected*/ ctx[1]);
    			attr_dev(li, "tabindex", li_tabindex_value = /*isSelected*/ ctx[1] ? 0 : -1);
    			attr_dev(li, "class", "svelte-tabs__tab svelte-lg6f9k");
    			toggle_class(li, "svelte-tabs__selected", /*isSelected*/ ctx[1]);
    			add_location(li, file$4, 30, 0, 477);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);

    			if (default_slot) {
    				default_slot.m(li, null);
    			}

    			/*li_binding*/ ctx[10](li);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(li, "click", /*click_handler*/ ctx[11], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*$controls*/ 4 && li_aria_controls_value !== (li_aria_controls_value = /*$controls*/ ctx[2][/*tab*/ ctx[3].id])) {
    				attr_dev(li, "aria-controls", li_aria_controls_value);
    			}

    			if (!current || dirty & /*isSelected*/ 2) {
    				attr_dev(li, "aria-selected", /*isSelected*/ ctx[1]);
    			}

    			if (!current || dirty & /*isSelected*/ 2 && li_tabindex_value !== (li_tabindex_value = /*isSelected*/ ctx[1] ? 0 : -1)) {
    				attr_dev(li, "tabindex", li_tabindex_value);
    			}

    			if (dirty & /*isSelected*/ 2) {
    				toggle_class(li, "svelte-tabs__selected", /*isSelected*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (default_slot) default_slot.d(detaching);
    			/*li_binding*/ ctx[10](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $selectedTab;
    	let $controls;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tab", slots, ['default']);
    	let tabEl;
    	const tab = { id: getId() };
    	const { registerTab, registerTabElement, selectTab, selectedTab, controls } = getContext(TABS);
    	validate_store(selectedTab, "selectedTab");
    	component_subscribe($$self, selectedTab, value => $$invalidate(7, $selectedTab = value));
    	validate_store(controls, "controls");
    	component_subscribe($$self, controls, value => $$invalidate(2, $controls = value));
    	let isSelected;
    	registerTab(tab);

    	onMount(async () => {
    		await tick();
    		registerTabElement(tabEl);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tab> was created with unknown prop '${key}'`);
    	});

    	function li_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			tabEl = $$value;
    			$$invalidate(0, tabEl);
    		});
    	}

    	const click_handler = () => selectTab(tab);

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onMount,
    		tick,
    		getId,
    		TABS,
    		tabEl,
    		tab,
    		registerTab,
    		registerTabElement,
    		selectTab,
    		selectedTab,
    		controls,
    		isSelected,
    		$selectedTab,
    		$controls
    	});

    	$$self.$inject_state = $$props => {
    		if ("tabEl" in $$props) $$invalidate(0, tabEl = $$props.tabEl);
    		if ("isSelected" in $$props) $$invalidate(1, isSelected = $$props.isSelected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$selectedTab*/ 128) {
    			$$invalidate(1, isSelected = $selectedTab === tab);
    		}
    	};

    	return [
    		tabEl,
    		isSelected,
    		$controls,
    		tab,
    		selectTab,
    		selectedTab,
    		controls,
    		$selectedTab,
    		$$scope,
    		slots,
    		li_binding,
    		click_handler
    	];
    }

    class Tab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tab",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\SvelteTabs\TabList.svelte generated by Svelte v3.34.0 */

    const file$3 = "src\\SvelteTabs\\TabList.svelte";

    function create_fragment$3(ctx) {
    	let ul;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			if (default_slot) default_slot.c();
    			attr_dev(ul, "role", "tablist");
    			attr_dev(ul, "class", "svelte-tabs__tab-list svelte-lp409l");
    			add_location(ul, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			if (default_slot) {
    				default_slot.m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TabList", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TabList> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class TabList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabList",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\SvelteTabs\TabPanel.svelte generated by Svelte v3.34.0 */
    const file$2 = "src\\SvelteTabs\\TabPanel.svelte";

    // (21:2) {#if $selectedPanel === panel}
    function create_if_block(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(21:2) {#if $selectedPanel === panel}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let div_aria_labelledby_value;
    	let current;
    	let if_block = /*$selectedPanel*/ ctx[1] === /*panel*/ ctx[2] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "id", /*panel*/ ctx[2].id);
    			attr_dev(div, "aria-labelledby", div_aria_labelledby_value = /*$labeledBy*/ ctx[0][/*panel*/ ctx[2].id]);
    			attr_dev(div, "class", "svelte-tabs__tab-panel svelte-wi195k");
    			attr_dev(div, "role", "tabpanel");
    			add_location(div, file$2, 14, 0, 266);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$selectedPanel*/ ctx[1] === /*panel*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$selectedPanel*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*$labeledBy*/ 1 && div_aria_labelledby_value !== (div_aria_labelledby_value = /*$labeledBy*/ ctx[0][/*panel*/ ctx[2].id])) {
    				attr_dev(div, "aria-labelledby", div_aria_labelledby_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $labeledBy;
    	let $selectedPanel;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TabPanel", slots, ['default']);
    	const panel = { id: getId() };
    	const { registerPanel, selectedPanel, labeledBy } = getContext(TABS);
    	validate_store(selectedPanel, "selectedPanel");
    	component_subscribe($$self, selectedPanel, value => $$invalidate(1, $selectedPanel = value));
    	validate_store(labeledBy, "labeledBy");
    	component_subscribe($$self, labeledBy, value => $$invalidate(0, $labeledBy = value));
    	registerPanel(panel);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TabPanel> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		getId,
    		TABS,
    		panel,
    		registerPanel,
    		selectedPanel,
    		labeledBy,
    		$labeledBy,
    		$selectedPanel
    	});

    	return [$labeledBy, $selectedPanel, panel, selectedPanel, labeledBy, $$scope, slots];
    }

    class TabPanel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabPanel",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* tests\SvelteTabs\index.svelte generated by Svelte v3.34.0 */
    const file$1 = "tests\\SvelteTabs\\index.svelte";

    // (7:4) <Tab>
    function create_default_slot_7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("One");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(7:4) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (8:4) <Tab>
    function create_default_slot_6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Two");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(8:4) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (9:4) <Tab>
    function create_default_slot_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Three");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(9:4) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (6:2) <TabList>
    function create_default_slot_4(ctx) {
    	let tab0;
    	let t0;
    	let tab1;
    	let t1;
    	let tab2;
    	let current;

    	tab0 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tab1 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tab2 = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tab0.$$.fragment);
    			t0 = space();
    			create_component(tab1.$$.fragment);
    			t1 = space();
    			create_component(tab2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tab0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(tab1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(tab2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tab0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				tab0_changes.$$scope = { dirty, ctx };
    			}

    			tab0.$set(tab0_changes);
    			const tab1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				tab1_changes.$$scope = { dirty, ctx };
    			}

    			tab1.$set(tab1_changes);
    			const tab2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				tab2_changes.$$scope = { dirty, ctx };
    			}

    			tab2.$set(tab2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tab0.$$.fragment, local);
    			transition_in(tab1.$$.fragment, local);
    			transition_in(tab2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tab0.$$.fragment, local);
    			transition_out(tab1.$$.fragment, local);
    			transition_out(tab2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tab0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(tab1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(tab2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(6:2) <TabList>",
    		ctx
    	});

    	return block;
    }

    // (12:2) <TabPanel>
    function create_default_slot_3(ctx) {
    	let div;
    	let h2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Panel One";
    			add_location(h2, file$1, 13, 6, 246);
    			attr_dev(div, "class", "p-2");
    			add_location(div, file$1, 12, 4, 221);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(12:2) <TabPanel>",
    		ctx
    	});

    	return block;
    }

    // (18:2) <TabPanel>
    function create_default_slot_2(ctx) {
    	let div;
    	let h2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Panel Two";
    			add_location(h2, file$1, 19, 6, 338);
    			attr_dev(div, "class", "p-2");
    			add_location(div, file$1, 18, 4, 313);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(18:2) <TabPanel>",
    		ctx
    	});

    	return block;
    }

    // (24:2) <TabPanel>
    function create_default_slot_1(ctx) {
    	let div;
    	let h2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Panel Three";
    			add_location(h2, file$1, 25, 6, 430);
    			attr_dev(div, "class", "p-2");
    			add_location(div, file$1, 24, 4, 405);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(24:2) <TabPanel>",
    		ctx
    	});

    	return block;
    }

    // (5:0) <Tabs>
    function create_default_slot$1(ctx) {
    	let tablist;
    	let t0;
    	let tabpanel0;
    	let t1;
    	let tabpanel1;
    	let t2;
    	let tabpanel2;
    	let current;

    	tablist = new TabList({
    			props: {
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tabpanel0 = new TabPanel({
    			props: {
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tabpanel1 = new TabPanel({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tabpanel2 = new TabPanel({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tablist.$$.fragment);
    			t0 = space();
    			create_component(tabpanel0.$$.fragment);
    			t1 = space();
    			create_component(tabpanel1.$$.fragment);
    			t2 = space();
    			create_component(tabpanel2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tablist, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(tabpanel0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(tabpanel1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(tabpanel2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tablist_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				tablist_changes.$$scope = { dirty, ctx };
    			}

    			tablist.$set(tablist_changes);
    			const tabpanel0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				tabpanel0_changes.$$scope = { dirty, ctx };
    			}

    			tabpanel0.$set(tabpanel0_changes);
    			const tabpanel1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				tabpanel1_changes.$$scope = { dirty, ctx };
    			}

    			tabpanel1.$set(tabpanel1_changes);
    			const tabpanel2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				tabpanel2_changes.$$scope = { dirty, ctx };
    			}

    			tabpanel2.$set(tabpanel2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tablist.$$.fragment, local);
    			transition_in(tabpanel0.$$.fragment, local);
    			transition_in(tabpanel1.$$.fragment, local);
    			transition_in(tabpanel2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tablist.$$.fragment, local);
    			transition_out(tabpanel0.$$.fragment, local);
    			transition_out(tabpanel1.$$.fragment, local);
    			transition_out(tabpanel2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tablist, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(tabpanel0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(tabpanel1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(tabpanel2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(5:0) <Tabs>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let tabs;
    	let current;

    	tabs = new Tabs({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tabs.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(tabs, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const tabs_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				tabs_changes.$$scope = { dirty, ctx };
    			}

    			tabs.$set(tabs_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabs.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabs.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tabs, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SvelteTabs", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SvelteTabs> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Tabs, Tab, TabList, TabPanel });
    	return [];
    }

    class SvelteTabs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SvelteTabs",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    var name = "svelte-rodry-common";
    var svelte = "src/index.js";
    var module = "dist/index.mjs";
    var main = "dist/index.js";
    var version = "1.1.0";
    var scripts = {
    	build: "rollup -c",
    	prepublishOnly: "npm run build",
    	dev: "rollup -c rollup.config.dev.js -w",
    	start: "sirv public"
    };
    var devDependencies = {
    	"@rollup/plugin-commonjs": "^17.1.0",
    	"@rollup/plugin-json": "^4.1.0",
    	"@rollup/plugin-node-resolve": "^11.2.0",
    	rollup: "^2.40.0",
    	"rollup-plugin-css-only": "^3.1.0",
    	"rollup-plugin-livereload": "^2.0.0",
    	"rollup-plugin-serve": "^1.1.0",
    	"rollup-plugin-svelte": "^7.1.0",
    	"sirv-cli": "^1.0.11",
    	svelte: "^3.34.0",
    	tailwindcss: "^2.0.3"
    };
    var keywords = [
    	"svelte"
    ];
    var files = [
    	"src",
    	"dist"
    ];
    var pkg = {
    	name: name,
    	svelte: svelte,
    	module: module,
    	main: main,
    	version: version,
    	scripts: scripts,
    	devDependencies: devDependencies,
    	keywords: keywords,
    	files: files
    };

    /* tests\App.svelte generated by Svelte v3.34.0 */
    const file = "tests\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (272:8) <div slot="title">
    function create_title_slot(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Modal Title";
    			attr_dev(div, "slot", "title");
    			attr_dev(div, "class", "svelte-g1xzir");
    			add_location(div, file, 271, 8, 5505);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot.name,
    		type: "slot",
    		source: "(272:8) <div slot=\\\"title\\\">",
    		ctx
    	});

    	return block;
    }

    // (273:8) <div slot="body">
    function create_body_slot(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Modal Body";
    			attr_dev(div, "slot", "body");
    			attr_dev(div, "class", "svelte-g1xzir");
    			add_location(div, file, 272, 8, 5550);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_body_slot.name,
    		type: "slot",
    		source: "(273:8) <div slot=\\\"body\\\">",
    		ctx
    	});

    	return block;
    }

    // (274:8) <div slot="footer" class="grid justify-items-end">
    function create_footer_slot(ctx) {
    	let div;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Close";
    			attr_dev(button, "class", "svelte-g1xzir");
    			add_location(button, file, 274, 10, 5655);
    			attr_dev(div, "slot", "footer");
    			attr_dev(div, "class", "grid justify-items-end svelte-g1xzir");
    			add_location(div, file, 273, 8, 5593);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*toggleModal*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_footer_slot.name,
    		type: "slot",
    		source: "(274:8) <div slot=\\\"footer\\\" class=\\\"grid justify-items-end\\\">",
    		ctx
    	});

    	return block;
    }

    // (271:6) <Modal cssClass="w-8/12" show={showModal} onClose={toggleModal}>
    function create_default_slot(ctx) {
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = space();
    			t1 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(271:6) <Modal cssClass=\\\"w-8/12\\\" show={showModal} onClose={toggleModal}>",
    		ctx
    	});

    	return block;
    }

    // (297:12) {#each selectedCountries as country}
    function create_each_block(ctx) {
    	let small;
    	let t0_value = /*country*/ ctx[7] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			small = element("small");
    			t0 = text(t0_value);
    			t1 = text(",");
    			attr_dev(small, "class", "svelte-g1xzir");
    			add_location(small, file, 297, 14, 6394);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, small, anchor);
    			append_dev(small, t0);
    			append_dev(small, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectedCountries*/ 2 && t0_value !== (t0_value = /*country*/ ctx[7] + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(small);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(297:12) {#each selectedCountries as country}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let title_value;
    	let t0;
    	let main;
    	let h1;
    	let t5;
    	let h2;
    	let t7;
    	let section0;
    	let div0;
    	let h30;
    	let t9;
    	let button;
    	let t11;
    	let modal;
    	let t12;
    	let section1;
    	let div4;
    	let h31;
    	let t14;
    	let div3;
    	let label;
    	let t15;
    	let multiselect;
    	let t16;
    	let div2;
    	let h5;
    	let t18;
    	let div1;
    	let t19;
    	let section2;
    	let div5;
    	let h32;
    	let t21;
    	let sveltetabs;
    	let t22;
    	let section3;
    	let div7;
    	let h33;
    	let t24;
    	let div6;
    	let treeview;
    	let t25;
    	let section4;
    	let div8;
    	let h34;
    	let t27;
    	let breadcrumbs;
    	let current;
    	let mounted;
    	let dispose;
    	document.title = title_value = "" + (pkg.name + " (v" + pkg.version + ")");

    	modal = new Modal({
    			props: {
    				cssClass: "w-8/12",
    				show: /*showModal*/ ctx[0],
    				onClose: /*toggleModal*/ ctx[5],
    				$$slots: {
    					default: [create_default_slot],
    					footer: [create_footer_slot],
    					body: [create_body_slot],
    					title: [create_title_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	multiselect = new MultiSelect({
    			props: {
    				items: /*items*/ ctx[4],
    				value: /*selectedCountries*/ ctx[1],
    				onChange: /*func*/ ctx[6]
    			},
    			$$inline: true
    		});

    	let each_value = /*selectedCountries*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	sveltetabs = new SvelteTabs({ $$inline: true });

    	treeview = new Treeview({
    			props: { items: /*treeviewItems*/ ctx[3] },
    			$$inline: true
    		});

    	breadcrumbs = new Breadcrumbs({
    			props: { items: /*crumbs*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			t0 = space();
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = `${pkg.name} (v${pkg.version})`;
    			t5 = space();
    			h2 = element("h2");
    			h2.textContent = "Testing Playground";
    			t7 = space();
    			section0 = element("section");
    			div0 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Modal";
    			t9 = space();
    			button = element("button");
    			button.textContent = "Show Modal";
    			t11 = space();
    			create_component(modal.$$.fragment);
    			t12 = space();
    			section1 = element("section");
    			div4 = element("div");
    			h31 = element("h3");
    			h31.textContent = "MultiSelect";
    			t14 = space();
    			div3 = element("div");
    			label = element("label");
    			t15 = text("Country List\r\n          ");
    			create_component(multiselect.$$.fragment);
    			t16 = space();
    			div2 = element("div");
    			h5 = element("h5");
    			h5.textContent = "Items selected";
    			t18 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t19 = space();
    			section2 = element("section");
    			div5 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Svelte Tabs";
    			t21 = space();
    			create_component(sveltetabs.$$.fragment);
    			t22 = space();
    			section3 = element("section");
    			div7 = element("div");
    			h33 = element("h3");
    			h33.textContent = "Treeview";
    			t24 = space();
    			div6 = element("div");
    			create_component(treeview.$$.fragment);
    			t25 = space();
    			section4 = element("section");
    			div8 = element("div");
    			h34 = element("h3");
    			h34.textContent = "Breadcrumbs";
    			t27 = space();
    			create_component(breadcrumbs.$$.fragment);
    			attr_dev(h1, "class", "text-center svelte-g1xzir");
    			add_location(h1, file, 261, 2, 5164);
    			attr_dev(h2, "class", "svelte-g1xzir");
    			add_location(h2, file, 262, 2, 5224);
    			attr_dev(h30, "class", "svelte-g1xzir");
    			add_location(h30, file, 266, 6, 5347);
    			attr_dev(button, "class", "svelte-g1xzir");
    			add_location(button, file, 268, 6, 5371);
    			attr_dev(div0, "class", "rounded border border-gray-200 p-2 shadow svelte-g1xzir");
    			add_location(div0, file, 265, 4, 5284);
    			attr_dev(section0, "class", "p-2 svelte-g1xzir");
    			add_location(section0, file, 264, 2, 5257);
    			attr_dev(h31, "class", "svelte-g1xzir");
    			add_location(h31, file, 283, 6, 5878);
    			attr_dev(label, "for", "country-list");
    			attr_dev(label, "class", "svelte-g1xzir");
    			add_location(label, file, 285, 8, 5950);
    			attr_dev(h5, "class", "px-2 svelte-g1xzir");
    			add_location(h5, file, 294, 10, 6243);
    			attr_dev(div1, "class", "px-2 h-20 overflow-auto svelte-g1xzir");
    			add_location(div1, file, 295, 10, 6291);
    			attr_dev(div2, "class", " rounded bg-gray-200 w-6/12  svelte-g1xzir");
    			add_location(div2, file, 293, 8, 6189);
    			attr_dev(div3, "class", "flex justify-between svelte-g1xzir");
    			add_location(div3, file, 284, 6, 5906);
    			attr_dev(div4, "class", "rounded border border-gray-200 p-2 shadow svelte-g1xzir");
    			add_location(div4, file, 282, 4, 5815);
    			attr_dev(section1, "class", "p-2 svelte-g1xzir");
    			add_location(section1, file, 281, 2, 5788);
    			attr_dev(h32, "class", "svelte-g1xzir");
    			add_location(h32, file, 308, 6, 6634);
    			attr_dev(div5, "class", "rounded border border-gray-200 p-2 shadow svelte-g1xzir");
    			add_location(div5, file, 307, 4, 6571);
    			attr_dev(section2, "class", "p-2 svelte-g1xzir");
    			add_location(section2, file, 306, 2, 6544);
    			attr_dev(h33, "class", "svelte-g1xzir");
    			add_location(h33, file, 316, 6, 6819);
    			attr_dev(div6, "class", "w-3/12 bg-gray-200 p-2 svelte-g1xzir");
    			add_location(div6, file, 317, 6, 6844);
    			attr_dev(div7, "class", "rounded border border-gray-200 p-2 shadow svelte-g1xzir");
    			add_location(div7, file, 315, 4, 6756);
    			attr_dev(section3, "class", "p-2 svelte-g1xzir");
    			add_location(section3, file, 314, 2, 6729);
    			attr_dev(h34, "class", "svelte-g1xzir");
    			add_location(h34, file, 326, 6, 7084);
    			attr_dev(div8, "class", "rounded border border-gray-200 p-2 shadow svelte-g1xzir");
    			add_location(div8, file, 325, 4, 7021);
    			attr_dev(section4, "class", "p-2 svelte-g1xzir");
    			add_location(section4, file, 324, 2, 6994);
    			attr_dev(main, "class", "w-full svelte-g1xzir");
    			add_location(main, file, 260, 0, 5139);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t5);
    			append_dev(main, h2);
    			append_dev(main, t7);
    			append_dev(main, section0);
    			append_dev(section0, div0);
    			append_dev(div0, h30);
    			append_dev(div0, t9);
    			append_dev(div0, button);
    			append_dev(div0, t11);
    			mount_component(modal, div0, null);
    			append_dev(main, t12);
    			append_dev(main, section1);
    			append_dev(section1, div4);
    			append_dev(div4, h31);
    			append_dev(div4, t14);
    			append_dev(div4, div3);
    			append_dev(div3, label);
    			append_dev(label, t15);
    			mount_component(multiselect, label, null);
    			append_dev(div3, t16);
    			append_dev(div3, div2);
    			append_dev(div2, h5);
    			append_dev(div2, t18);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(main, t19);
    			append_dev(main, section2);
    			append_dev(section2, div5);
    			append_dev(div5, h32);
    			append_dev(div5, t21);
    			mount_component(sveltetabs, div5, null);
    			append_dev(main, t22);
    			append_dev(main, section3);
    			append_dev(section3, div7);
    			append_dev(div7, h33);
    			append_dev(div7, t24);
    			append_dev(div7, div6);
    			mount_component(treeview, div6, null);
    			append_dev(main, t25);
    			append_dev(main, section4);
    			append_dev(section4, div8);
    			append_dev(div8, h34);
    			append_dev(div8, t27);
    			mount_component(breadcrumbs, div8, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*toggleModal*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*pkg*/ 0) && title_value !== (title_value = "" + (pkg.name + " (v" + pkg.version + ")"))) {
    				document.title = title_value;
    			}

    			const modal_changes = {};
    			if (dirty & /*showModal*/ 1) modal_changes.show = /*showModal*/ ctx[0];

    			if (dirty & /*$$scope*/ 1024) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    			const multiselect_changes = {};
    			if (dirty & /*selectedCountries*/ 2) multiselect_changes.value = /*selectedCountries*/ ctx[1];
    			if (dirty & /*selectedCountries*/ 2) multiselect_changes.onChange = /*func*/ ctx[6];
    			multiselect.$set(multiselect_changes);

    			if (dirty & /*selectedCountries*/ 2) {
    				each_value = /*selectedCountries*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			transition_in(multiselect.$$.fragment, local);
    			transition_in(sveltetabs.$$.fragment, local);
    			transition_in(treeview.$$.fragment, local);
    			transition_in(breadcrumbs.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			transition_out(multiselect.$$.fragment, local);
    			transition_out(sveltetabs.$$.fragment, local);
    			transition_out(treeview.$$.fragment, local);
    			transition_out(breadcrumbs.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(modal);
    			destroy_component(multiselect);
    			destroy_each(each_blocks, detaching);
    			destroy_component(sveltetabs);
    			destroy_component(treeview);
    			destroy_component(breadcrumbs);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	const crumbs = [
    		{ label: "Main", url: "#/main" },
    		{ label: "Queries", url: "#/main/queries" },
    		{
    			label: "Order Search",
    			url: "#/main/queries/order-search"
    		}
    	];

    	const treeviewItems = [
    		{
    			title: "Main",
    			url: "#/main",
    			children: [
    				{
    					title: "Order Entry",
    					url: "#/order-entry"
    				},
    				{
    					title: "Queries",
    					url: "#/main/queries",
    					children: [
    						{
    							title: "Order Search",
    							url: "#/main/queries/order-search"
    						},
    						{
    							title: "Patient Search",
    							url: "#/main/queries/patient-search"
    						}
    					]
    				}
    			]
    		},
    		{
    			title: "Administration",
    			url: "#/administration",
    			children: [
    				{
    					title: "Test",
    					url: "#/administration/tests"
    				},
    				{
    					title: "Users",
    					url: "#/administration/users"
    				},
    				{ title: "QC", url: "#/administration/qc" },
    				{
    					title: "ICA",
    					url: "#/administration/ica"
    				}
    			]
    		},
    		{ title: "Monitoring", url: "#/monitoring" }
    	];

    	let showModal = false;

    	const items = [
    		"Afghanistan",
    		"Albania",
    		"Algeria",
    		"Andorra",
    		"Angola",
    		"Anguilla",
    		"Antigua & Barbuda",
    		"Argentina",
    		"Armenia",
    		"Aruba",
    		"Australia",
    		"Austria",
    		"Azerbaijan",
    		"Bahamas",
    		"Bahrain",
    		"Bangladesh",
    		"Barbados",
    		"Belarus",
    		"Belgium",
    		"Belize",
    		"Benin",
    		"Bermuda",
    		"Bhutan",
    		"Bolivia",
    		"Bosnia &amp; Herzegovina",
    		"Botswana",
    		"Brazil",
    		"British Virgin Islands",
    		"Brunei",
    		"Bulgaria",
    		"Burkina Faso",
    		"Burundi",
    		"Cambodia",
    		"Cameroon",
    		"Cape Verde",
    		"Cayman Islands",
    		"Chad",
    		"Chile",
    		"China",
    		"Colombia",
    		"Congo",
    		"Cook Islands",
    		"Costa Rica",
    		"Cote D Ivoire",
    		"Croatia",
    		"Cruise Ship",
    		"Cuba",
    		"Cyprus",
    		"Czech Republic",
    		"Denmark",
    		"Djibouti",
    		"Dominica",
    		"Dominican Republic",
    		"Ecuador",
    		"Egypt",
    		"El Salvador",
    		"Equatorial Guinea",
    		"Estonia",
    		"Ethiopia",
    		"Falkland Islands",
    		"Faroe Islands",
    		"Fiji",
    		"Finland",
    		"France",
    		"French Polynesia",
    		"French West Indies",
    		"Gabon",
    		"Gambia",
    		"Georgia",
    		"Germany",
    		"Ghana",
    		"Gibraltar",
    		"Greece",
    		"Greenland",
    		"Grenada",
    		"Guam",
    		"Guatemala",
    		"Guernsey",
    		"Guinea",
    		"Guinea Bissau",
    		"Guyana",
    		"Haiti",
    		"Honduras",
    		"Hong Kong",
    		"Hungary",
    		"Iceland",
    		"India",
    		"Indonesia",
    		"Iran",
    		"Iraq",
    		"Ireland",
    		"Isle of Man",
    		"Israel",
    		"Italy",
    		"Jamaica",
    		"Japan",
    		"Jersey",
    		"Jordan",
    		"Kazakhstan",
    		"Kenya",
    		"Kuwait",
    		"Kyrgyz Republic",
    		"Laos",
    		"Latvia",
    		"Lebanon",
    		"Lesotho",
    		"Liberia",
    		"Libya",
    		"Liechtenstein",
    		"Lithuania",
    		"Luxembourg",
    		"Macau",
    		"Macedonia",
    		"Madagascar",
    		"Malawi",
    		"Malaysia",
    		"Maldives",
    		"Mali",
    		"Malta",
    		"Mauritania",
    		"Mauritius",
    		"Mexico",
    		"Moldova",
    		"Monaco",
    		"Mongolia",
    		"Montenegro",
    		"Montserrat",
    		"Morocco",
    		"Mozambique",
    		"Namibia",
    		"Nepal",
    		"Netherlands",
    		"Netherlands Antilles",
    		"New Caledonia",
    		"New Zealand",
    		"Nicaragua",
    		"Niger",
    		"Nigeria",
    		"Norway",
    		"Oman",
    		"Pakistan",
    		"Palestine",
    		"Panama",
    		"Papua New Guinea",
    		"Paraguay",
    		"Peru",
    		"Philippines",
    		"Poland",
    		"Portugal",
    		"Puerto Rico",
    		"Qatar",
    		"Reunion",
    		"Romania",
    		"Russia",
    		"Rwanda",
    		"Saint Pierre &amp; Miquelon",
    		"Samoa",
    		"San Marino",
    		"Satellite",
    		"Saudi Arabia",
    		"Senegal",
    		"Serbia",
    		"Seychelles",
    		"Sierra Leone",
    		"Singapore",
    		"Slovakia",
    		"Slovenia",
    		"South Africa",
    		"South Korea",
    		"Spain",
    		"Sri Lanka",
    		"St Kitts &amp; Nevis",
    		"St Lucia",
    		"St Vincent",
    		"St. Lucia",
    		"Sudan",
    		"Suriname",
    		"Swaziland",
    		"Sweden",
    		"Switzerland",
    		"Syria",
    		"Taiwan",
    		"Tajikistan",
    		"Tanzania",
    		"Thailand",
    		"Timor L'Este",
    		"Togo",
    		"Tonga",
    		"Trinidad &amp; Tobago",
    		"Tunisia",
    		"Turkey",
    		"Turkmenistan",
    		"Turks &amp; Caicos",
    		"Uganda",
    		"Ukraine",
    		"United Arab Emirates",
    		"United Kingdom",
    		"Uruguay",
    		"United States of America",
    		"Uzbekistan",
    		"Venezuela",
    		"Vietnam",
    		"Virgin Islands (US)",
    		"Yemen",
    		"Zambia",
    		"Zimbabwe"
    	];

    	let selectedCountries = [];
    	const toggleModal = () => $$invalidate(0, showModal = !showModal);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const func = value => $$invalidate(1, selectedCountries = value);

    	$$self.$capture_state = () => ({
    		Modal,
    		Treeview,
    		Breadcrumbs,
    		MultiSelect,
    		SvelteTabs,
    		crumbs,
    		treeviewItems,
    		pkg,
    		showModal,
    		items,
    		selectedCountries,
    		toggleModal
    	});

    	$$self.$inject_state = $$props => {
    		if ("showModal" in $$props) $$invalidate(0, showModal = $$props.showModal);
    		if ("selectedCountries" in $$props) $$invalidate(1, selectedCountries = $$props.selectedCountries);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [showModal, selectedCountries, crumbs, treeviewItems, items, toggleModal, func];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
