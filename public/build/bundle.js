
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
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
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
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
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
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
        const prop_values = options.props || {};
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
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
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
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
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
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/App.svelte generated by Svelte v3.16.7 */
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	child_ctx[25] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	child_ctx[25] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i].colors;
    	child_ctx[27] = list[i].name;
    	child_ctx[28] = list[i].emoji;
    	child_ctx[25] = i;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[31] = list[i];
    	child_ctx[25] = i;
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[33] = list[i];
    	child_ctx[25] = i;
    	return child_ctx;
    }

    // (78:3) {#each partName as n, i}
    function create_each_block_4(ctx) {
    	let span;
    	let t_value = /*n*/ ctx[33] + "";
    	let t;
    	let i = /*i*/ ctx[25];
    	let dispose;
    	const assign_span = () => /*span_binding*/ ctx[22](span, i);
    	const unassign_span = () => /*span_binding*/ ctx[22](null, i);

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "part svelte-li5ale");
    			toggle_class(span, "is-active", /*chosen_index*/ ctx[2] === /*i*/ ctx[25]);
    			add_location(span, file, 78, 4, 1872);
    			dispose = listen_dev(span, "click", /*changeColors*/ ctx[13](/*i*/ ctx[25]), false, false, false);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    			assign_span();
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (i !== /*i*/ ctx[25]) {
    				unassign_span();
    				i = /*i*/ ctx[25];
    				assign_span();
    			}

    			if (dirty[0] & /*chosen_index*/ 4) {
    				toggle_class(span, "is-active", /*chosen_index*/ ctx[2] === /*i*/ ctx[25]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			unassign_span();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(78:3) {#each partName as n, i}",
    		ctx
    	});

    	return block;
    }

    // (84:3) {#each partUrl as u, i}
    function create_each_block_3(ctx) {
    	let div;
    	let a;
    	let t_value = /*u*/ ctx[31] + "";
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", a_href_value = /*u*/ ctx[31]);
    			set_style(a, "color", "#ffffff");
    			add_location(a, file, 85, 5, 2259);
    			attr_dev(div, "class", "navurl svelte-li5ale");
    			set_style(div, "display", /*i*/ ctx[25] === /*chosen_index*/ ctx[2] ? "" : "none");
    			add_location(div, file, 84, 4, 2179);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*chosen_index*/ 4) {
    				set_style(div, "display", /*i*/ ctx[25] === /*chosen_index*/ ctx[2] ? "" : "none");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(84:3) {#each partUrl as u, i}",
    		ctx
    	});

    	return block;
    }

    // (95:9) {#each colors as color, i}
    function create_each_block_2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "color smallcolor svelte-li5ale");
    			set_style(div, "background-color", /*color*/ ctx[23]);
    			set_style(div, "flex-grow", (2 * /*i*/ ctx[25] + 1) ** (1 / 2));
    			add_location(div, file, 95, 10, 2663);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*curPartData*/ 1024) {
    				set_style(div, "background-color", /*color*/ ctx[23]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(95:9) {#each colors as color, i}",
    		ctx
    	});

    	return block;
    }

    // (91:5) {#each curPartData as { colors, name, emoji }
    function create_each_block_1(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let div0_class_value;
    	let t0;
    	let div1;
    	let t1_value = /*name*/ ctx[27] + "";
    	let t1;
    	let t2;
    	let dispose;
    	let each_value_2 = /*colors*/ ctx[26];
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div1 = element("div");
    			t1 = text(t1_value);
    			t2 = space();

    			attr_dev(div0, "class", div0_class_value = "colors smallcolors " + (/*colors*/ ctx[26].length > 7
    			? "morecolor"
    			: "lesscolor") + " svelte-li5ale");

    			add_location(div0, file, 93, 8, 2536);
    			attr_dev(div1, "class", "name svelte-li5ale");
    			add_location(div1, file, 98, 8, 2811);
    			attr_dev(div2, "class", "inner-container svelte-li5ale");
    			add_location(div2, file, 92, 7, 2498);
    			attr_dev(div3, "class", "inner-content svelte-li5ale");
    			add_location(div3, file, 91, 6, 2437);
    			dispose = listen_dev(div3, "click", /*getDetail*/ ctx[14](/*i*/ ctx[25]), false, false, false);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, t1);
    			append_dev(div3, t2);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*curPartData*/ 1024) {
    				each_value_2 = /*colors*/ ctx[26];
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}

    			if (dirty[0] & /*curPartData*/ 1024 && div0_class_value !== (div0_class_value = "colors smallcolors " + (/*colors*/ ctx[26].length > 7
    			? "morecolor"
    			: "lesscolor") + " svelte-li5ale")) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (dirty[0] & /*curPartData*/ 1024 && t1_value !== (t1_value = /*name*/ ctx[27] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(91:5) {#each curPartData as { colors, name, emoji }",
    		ctx
    	});

    	return block;
    }

    // (124:3) {#each chosen_colors as color, i}
    function create_each_block(ctx) {
    	let div;
    	let span0;
    	let t1;
    	let span1;
    	let t2_value = /*color*/ ctx[23] + "";
    	let t2;
    	let t3;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			span0.textContent = "COPY";
    			t1 = space();
    			span1 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			attr_dev(span0, "class", "color-copy svelte-li5ale");
    			add_location(span0, file, 125, 5, 3673);
    			attr_dev(span1, "class", "corner svelte-li5ale");
    			add_location(span1, file, 126, 5, 3717);
    			attr_dev(div, "class", "color bigcolor svelte-li5ale");
    			set_style(div, "background-color", /*color*/ ctx[23]);
    			set_style(div, "flex-grow", (2 * /*i*/ ctx[25] + 1) ** (1 / 2));
    			add_location(div, file, 124, 4, 3545);
    			dispose = listen_dev(div, "click", /*copy2clip*/ ctx[16], false, false, false);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(div, t1);
    			append_dev(div, span1);
    			append_dev(span1, t2);
    			append_dev(div, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*chosen_colors*/ 2 && t2_value !== (t2_value = /*color*/ ctx[23] + "")) set_data_dev(t2, t2_value);

    			if (dirty[0] & /*chosen_colors*/ 2) {
    				set_style(div, "background-color", /*color*/ ctx[23]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(124:3) {#each chosen_colors as color, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div14;
    	let div5;
    	let div1;
    	let t0;
    	let div0;
    	let t1;
    	let div4;
    	let t2;
    	let div3;
    	let div2;
    	let div5_style_value;
    	let t3;
    	let div6;
    	let t4;
    	let div13;
    	let div7;
    	let span0;
    	let t6;
    	let div8;
    	let div8_class_value;
    	let t7;
    	let div12;
    	let div11;
    	let div10;
    	let div9;
    	let i;
    	let t8;
    	let t9;
    	let span1;
    	let t10;
    	let div12_style_value;
    	let div13_style_value;
    	let dispose;
    	let each_value_4 = /*partName*/ ctx[11];
    	let each_blocks_3 = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks_3[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	let each_value_3 = /*partUrl*/ ctx[12];
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_2[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let each_value_1 = /*curPartData*/ ctx[10];
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*chosen_colors*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div14 = element("div");
    			div5 = element("div");
    			div1 = element("div");

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			t0 = space();
    			div0 = element("div");
    			t1 = space();
    			div4 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t2 = space();
    			div3 = element("div");
    			div2 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t3 = space();
    			div6 = element("div");
    			t4 = space();
    			div13 = element("div");
    			div7 = element("div");
    			span0 = element("span");
    			span0.textContent = "← Back";
    			t6 = space();
    			div8 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t7 = space();
    			div12 = element("div");
    			div11 = element("div");
    			div10 = element("div");
    			div9 = element("div");
    			i = element("i");
    			t8 = text(/*copiedMessage*/ ctx[8]);
    			t9 = space();
    			span1 = element("span");
    			t10 = text(/*copiedColor*/ ctx[9]);
    			attr_dev(div0, "class", "slider svelte-li5ale");
    			set_style(div0, "width", /*slider_width*/ ctx[3] - 10 + "px");
    			set_style(div0, "transform", "translateX(" + /*transform_dist*/ ctx[4] + "px)");
    			add_location(div0, file, 80, 3, 2006);
    			attr_dev(div1, "class", "header svelte-li5ale");
    			add_location(div1, file, 76, 2, 1819);
    			attr_dev(div2, "class", "inner svelte-li5ale");
    			add_location(div2, file, 89, 4, 2356);
    			attr_dev(div3, "class", "content");
    			add_location(div3, file, 88, 3, 2330);
    			attr_dev(div4, "class", "container svelte-li5ale");
    			add_location(div4, file, 82, 2, 2124);
    			attr_dev(div5, "class", "place1 svelte-li5ale");
    			attr_dev(div5, "style", div5_style_value = /*detailPage*/ ctx[6] ? "display:none" : "");
    			add_location(div5, file, 75, 1, 1753);
    			attr_dev(div6, "class", "mask svelte-li5ale");
    			toggle_class(div6, "mask-move", /*loadmask*/ ctx[5]);
    			add_location(div6, file, 109, 1, 2997);
    			attr_dev(span0, "class", "back svelte-li5ale");
    			add_location(span0, file, 112, 3, 3143);
    			attr_dev(div7, "class", "dheader svelte-li5ale");
    			add_location(div7, file, 111, 2, 3118);

    			attr_dev(div8, "class", div8_class_value = "colors bigcolors " + (/*chosen_colors*/ ctx[1].length > 7
    			? "morecolor"
    			: "lesscolor") + " svelte-li5ale");

    			add_location(div8, file, 122, 2, 3418);
    			add_location(i, file, 133, 26, 3976);
    			attr_dev(div9, "class", "message svelte-li5ale");
    			add_location(div9, file, 133, 5, 3955);
    			attr_dev(span1, "class", "cc svelte-li5ale");
    			add_location(span1, file, 134, 5, 4012);
    			attr_dev(div10, "class", "colorShow svelte-li5ale");
    			add_location(div10, file, 132, 4, 3926);
    			attr_dev(div11, "class", "cont svelte-li5ale");
    			set_style(div11, "background-color", /*copiedColor*/ ctx[9]);
    			add_location(div11, file, 131, 3, 3863);
    			attr_dev(div12, "class", "success-mask svelte-li5ale");
    			attr_dev(div12, "style", div12_style_value = /*copiedShow*/ ctx[7] ? "" : "display:none");
    			add_location(div12, file, 130, 2, 3788);
    			attr_dev(div13, "class", "place2 svelte-li5ale");
    			attr_dev(div13, "style", div13_style_value = /*detailPage*/ ctx[6] ? "" : "display:none");
    			add_location(div13, file, 110, 1, 3052);
    			attr_dev(div14, "id", "app");
    			attr_dev(div14, "class", "svelte-li5ale");
    			add_location(div14, file, 74, 0, 1737);
    			dispose = listen_dev(span0, "click", /*goBack*/ ctx[15], false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div14, anchor);
    			append_dev(div14, div5);
    			append_dev(div5, div1);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].m(div1, null);
    			}

    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div5, t1);
    			append_dev(div5, div4);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div4, null);
    			}

    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div2, null);
    			}

    			append_dev(div14, t3);
    			append_dev(div14, div6);
    			append_dev(div14, t4);
    			append_dev(div14, div13);
    			append_dev(div13, div7);
    			append_dev(div7, span0);
    			append_dev(div13, t6);
    			append_dev(div13, div8);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div8, null);
    			}

    			append_dev(div13, t7);
    			append_dev(div13, div12);
    			append_dev(div12, div11);
    			append_dev(div11, div10);
    			append_dev(div10, div9);
    			append_dev(div9, i);
    			append_dev(i, t8);
    			append_dev(div10, t9);
    			append_dev(div10, span1);
    			append_dev(span1, t10);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*header, chosen_index, changeColors, partName*/ 10245) {
    				each_value_4 = /*partName*/ ctx[11];
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks_3[i]) {
    						each_blocks_3[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_3[i] = create_each_block_4(child_ctx);
    						each_blocks_3[i].c();
    						each_blocks_3[i].m(div1, t0);
    					}
    				}

    				for (; i < each_blocks_3.length; i += 1) {
    					each_blocks_3[i].d(1);
    				}

    				each_blocks_3.length = each_value_4.length;
    			}

    			if (dirty[0] & /*slider_width*/ 8) {
    				set_style(div0, "width", /*slider_width*/ ctx[3] - 10 + "px");
    			}

    			if (dirty[0] & /*transform_dist*/ 16) {
    				set_style(div0, "transform", "translateX(" + /*transform_dist*/ ctx[4] + "px)");
    			}

    			if (dirty[0] & /*chosen_index, partUrl*/ 4100) {
    				each_value_3 = /*partUrl*/ ctx[12];
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_3(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(div4, t2);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_3.length;
    			}

    			if (dirty[0] & /*getDetail, curPartData*/ 17408) {
    				each_value_1 = /*curPartData*/ ctx[10];
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty[0] & /*detailPage*/ 64 && div5_style_value !== (div5_style_value = /*detailPage*/ ctx[6] ? "display:none" : "")) {
    				attr_dev(div5, "style", div5_style_value);
    			}

    			if (dirty[0] & /*loadmask*/ 32) {
    				toggle_class(div6, "mask-move", /*loadmask*/ ctx[5]);
    			}

    			if (dirty[0] & /*chosen_colors, copy2clip*/ 65538) {
    				each_value = /*chosen_colors*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div8, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*chosen_colors*/ 2 && div8_class_value !== (div8_class_value = "colors bigcolors " + (/*chosen_colors*/ ctx[1].length > 7
    			? "morecolor"
    			: "lesscolor") + " svelte-li5ale")) {
    				attr_dev(div8, "class", div8_class_value);
    			}

    			if (dirty[0] & /*copiedMessage*/ 256) set_data_dev(t8, /*copiedMessage*/ ctx[8]);
    			if (dirty[0] & /*copiedColor*/ 512) set_data_dev(t10, /*copiedColor*/ ctx[9]);

    			if (dirty[0] & /*copiedColor*/ 512) {
    				set_style(div11, "background-color", /*copiedColor*/ ctx[9]);
    			}

    			if (dirty[0] & /*copiedShow*/ 128 && div12_style_value !== (div12_style_value = /*copiedShow*/ ctx[7] ? "" : "display:none")) {
    				attr_dev(div12, "style", div12_style_value);
    			}

    			if (dirty[0] & /*detailPage*/ 64 && div13_style_value !== (div13_style_value = /*detailPage*/ ctx[6] ? "" : "display:none")) {
    				attr_dev(div13, "style", div13_style_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div14);
    			destroy_each(each_blocks_3, detaching);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
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
    	let header = [];
    	let partName = window.jsonData.map(v => v.name);
    	let partUrl = window.jsonData.map(v => v.data.url);
    	let partData = window.jsonData.map(v => v.data.inner);
    	let chosen_colors = [];
    	let chosen_index = 0;
    	let header_width = [0, 0];
    	let slider_width = 0;
    	let transform_dist = 0;
    	let loadmask = false;
    	let loadmask2right = false;
    	let detailPage = false;
    	let emoji_array = window.emoji_array;
    	let emojiChange = "";
    	let copiedShow = false;
    	let copiedMessage = "";
    	let copiedColor = "";

    	const changeColors = index => () => {
    		$$invalidate(2, chosen_index = index);
    		$$invalidate(3, slider_width = header_width[index]);
    		$$invalidate(4, transform_dist = index - 1 < 0 ? 0 : header_width[index - 1]);
    	};

    	const getDetail = index => () => {
    		if (loadmask) return false;
    		$$invalidate(1, chosen_colors = partData[chosen_index][index].colors);
    		$$invalidate(5, loadmask = true);

    		setTimeout(
    			() => {
    				$$invalidate(6, detailPage = true);
    			},
    			300
    		);
    	};

    	const goBack = () => {
    		$$invalidate(5, loadmask = false);

    		setTimeout(
    			() => {
    				$$invalidate(6, detailPage = false);
    			},
    			300
    		);
    	};

    	const copy2clip = () => {
    		const messages = ["COPIED!", "GOT IT!", "PASTE ME!", "IT'LL ROCK!", "RIGHT ONE!", "WILL DO!"];

    		new ClipboardJS(".bigcolor",
    		{
    				text: trigger => {
    					const color = trigger.style.backgroundColor;
    					return color;
    				}
    			}).on("success", ({ text }) => {
    			$$invalidate(8, copiedMessage = messages[Math.floor(Math.random() * messages.length)]);
    			$$invalidate(9, copiedColor = text);
    			$$invalidate(7, copiedShow = true);

    			setTimeout(
    				() => {
    					$$invalidate(7, copiedShow = false);
    					$$invalidate(8, copiedMessage = "");
    					$$invalidate(9, copiedColor = "");
    				},
    				1000
    			);
    		});
    	};

    	onMount(() => {
    		header_width = header.map(v => {
    			const { width } = v.getBoundingClientRect();
    			return width;
    		});

    		$$invalidate(3, slider_width = header_width[chosen_index]);
    	});

    	function span_binding($$value, i) {
    		if (header[i] === $$value) return;

    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			header[i] = $$value;
    			$$invalidate(0, header);
    		});
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("header" in $$props) $$invalidate(0, header = $$props.header);
    		if ("partName" in $$props) $$invalidate(11, partName = $$props.partName);
    		if ("partUrl" in $$props) $$invalidate(12, partUrl = $$props.partUrl);
    		if ("partData" in $$props) $$invalidate(18, partData = $$props.partData);
    		if ("chosen_colors" in $$props) $$invalidate(1, chosen_colors = $$props.chosen_colors);
    		if ("chosen_index" in $$props) $$invalidate(2, chosen_index = $$props.chosen_index);
    		if ("header_width" in $$props) header_width = $$props.header_width;
    		if ("slider_width" in $$props) $$invalidate(3, slider_width = $$props.slider_width);
    		if ("transform_dist" in $$props) $$invalidate(4, transform_dist = $$props.transform_dist);
    		if ("loadmask" in $$props) $$invalidate(5, loadmask = $$props.loadmask);
    		if ("loadmask2right" in $$props) loadmask2right = $$props.loadmask2right;
    		if ("detailPage" in $$props) $$invalidate(6, detailPage = $$props.detailPage);
    		if ("emoji_array" in $$props) emoji_array = $$props.emoji_array;
    		if ("emojiChange" in $$props) emojiChange = $$props.emojiChange;
    		if ("copiedShow" in $$props) $$invalidate(7, copiedShow = $$props.copiedShow);
    		if ("copiedMessage" in $$props) $$invalidate(8, copiedMessage = $$props.copiedMessage);
    		if ("copiedColor" in $$props) $$invalidate(9, copiedColor = $$props.copiedColor);
    		if ("curPartData" in $$props) $$invalidate(10, curPartData = $$props.curPartData);
    	};

    	let curPartData;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*chosen_index*/ 4) {
    			 $$invalidate(10, curPartData = partData[chosen_index]);
    		}
    	};

    	return [
    		header,
    		chosen_colors,
    		chosen_index,
    		slider_width,
    		transform_dist,
    		loadmask,
    		detailPage,
    		copiedShow,
    		copiedMessage,
    		copiedColor,
    		curPartData,
    		partName,
    		partUrl,
    		changeColors,
    		getDetail,
    		goBack,
    		copy2clip,
    		header_width,
    		partData,
    		loadmask2right,
    		emoji_array,
    		emojiChange,
    		span_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
