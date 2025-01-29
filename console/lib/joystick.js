/*
FluxaBox Lib
joystick,btns
*/

const Joystick = (() => {
    let instances = new Set();
    let touchIds = new Map();

    const createJoystick = (options = {}) => {
        if (!options.id) {
            throw new Error('Joystick ID é necessário');
        }

        if (instances.has(options.id)) {
            throw new Error(`Um joystick com ID "${options.id}" já existe`);
        }

        const state = {
            position: { x: 0, y: 0 },
            distance: 0,
            angle: 0,
            base: null,
            stick: null,
            baseRect: null,
            centerX: 0,
            centerY: 0,
            currentTouchId: null
        };

        const defaultOptions = {
            size: 100,
            stickSize: 50,
            maxDistance: 40,
            position: { bottom: '20px', left: '20px' },
            mode: 'static',
            baseColor: '#444444',
            baseGradient: null,
            baseOpacity: 0.8,
            baseBorder: null,
            baseBorderSize: 0,
            stickColor: '#666666',
            stickGradient: null,
            stickOpacity: 1,
            stickBorder: null,
            stickBorderSize: 0,
            container: document.body
        };

        const settings = { ...defaultOptions, ...options };

        const getBackgroundStyle = (color, gradient) => {
            return gradient || color;
        };

        const moveStick = (event) => {
            event.preventDefault();
            let clientX, clientY;

            if (event.touches) {
                const touch = Array.from(event.touches).find(t => t.identifier === state.currentTouchId);
                if (!touch) return;
                
                clientX = touch.clientX;
                clientY = touch.clientY;
            } else {
                clientX = event.clientX;
                clientY = event.clientY;
            }

            const rect = state.base.getBoundingClientRect();
            state.centerX = rect.left + settings.size / 2;
            state.centerY = rect.top + settings.size / 2;

            const deltaX = clientX - state.centerX;
            const deltaY = clientY - state.centerY;
            const distance = Math.min(settings.maxDistance, 
                Math.sqrt(deltaX * deltaX + deltaY * deltaY));
            const angle = Math.atan2(deltaY, deltaX);

            state.distance = distance;
            state.angle = angle;

            state.position = {
                x: (distance * Math.cos(angle)) / settings.maxDistance,
                y: (distance * Math.sin(angle)) / settings.maxDistance
            };

            const moveX = distance * Math.cos(angle);
            const moveY = distance * Math.sin(angle);

            state.stick.style.transform = `translate(${moveX}px, ${moveY}px)`;
        };

        const resetStick = (event) => {
            if (event.touches) {
                const touchStillExists = Array.from(event.touches).some(
                    touch => touch.identifier === state.currentTouchId
                );
                if (touchStillExists) return;
            }

            state.currentTouchId = null;
            touchIds.delete(settings.id);
            
            state.stick.style.transform = 'translate(0, 0)';
            state.position = { x: 0, y: 0 };
            state.distance = 0;
            state.angle = 0;
        };

        const bindEvents = () => {
            state.base.addEventListener('touchstart', (e) => {
                if (state.currentTouchId !== null) return;

                const rect = state.base.getBoundingClientRect();
                const touch = Array.from(e.touches).find(touch => {
                    return !Array.from(touchIds.values()).includes(touch.identifier) &&
                        touch.clientX >= rect.left &&
                        touch.clientX <= rect.right &&
                        touch.clientY >= rect.top &&
                        touch.clientY <= rect.bottom;
                });

                if (touch) {
                    state.currentTouchId = touch.identifier;
                    touchIds.set(settings.id, touch.identifier);
                    moveStick(e);
                }
            });

            state.base.addEventListener('touchmove', moveStick);
            state.base.addEventListener('touchend', resetStick);
            state.base.addEventListener('touchcancel', resetStick);

            let isMouseDown = false;
            state.base.addEventListener('mousedown', (e) => {
                if (state.currentTouchId !== null) return;
                
                isMouseDown = true;
                moveStick(e);

                const mouseMoveHandler = (e) => {
                    if (isMouseDown) {
                        moveStick(e);
                    }
                };

                const mouseUpHandler = () => {
                    isMouseDown = false;
                    document.removeEventListener('mousemove', mouseMoveHandler);
                    document.removeEventListener('mouseup', mouseUpHandler);
                    resetStick(e);
                };

                document.addEventListener('mousemove', mouseMoveHandler);
                document.addEventListener('mouseup', mouseUpHandler);
            });
        };

        const init = () => {
            state.base = document.createElement('div');
            state.base.id = settings.id;
            
            const positionStyle = Object.entries(settings.position)
                .map(([key, value]) => `${key}: ${typeof value === 'number' ? value + 'px' : value}`)
                .join(';');

            state.base.style.cssText = `
                width: ${settings.size}px;
                height: ${settings.size}px;
                background: ${getBackgroundStyle(settings.baseColor, settings.baseGradient)};
                border-radius: 50%;
                position: ${settings.mode === 'static' ? 'absolute' : 'fixed'};
                ${positionStyle};
                touch-action: none;
                user-select: none;
                opacity: ${settings.baseOpacity};
                ${settings.baseBorder ? `border: ${settings.baseBorderSize}px solid ${settings.baseBorder}` : ''};
            `;

            state.stick = document.createElement('div');
            state.stick.style.cssText = `
                width: ${settings.stickSize}px;
                height: ${settings.stickSize}px;
                background: ${getBackgroundStyle(settings.stickColor, settings.stickGradient)};
                border-radius: 50%;
                position: absolute;
                top: ${(settings.size - settings.stickSize) / 2}px;
                left: ${(settings.size - settings.stickSize) / 2}px;
                transition: transform 0.1s ease-out;
                opacity: ${settings.stickOpacity};
                ${settings.stickBorder ? `border: ${settings.stickBorderSize}px solid ${settings.stickBorder}` : ''};
            `;

            state.base.appendChild(state.stick);
            settings.container.appendChild(state.base);

            state.baseRect = state.base.getBoundingClientRect();
            state.centerX = state.baseRect.left + settings.size / 2;
            state.centerY = state.baseRect.top + settings.size / 2;

            instances.add(settings.id);

            bindEvents();
        };

        init();

        return {
            getState: () => ({
                position: state.position,
                angle: state.angle,
                distance: state.distance
            }),
            destroy: () => {
                state.base.remove();
                instances.delete(settings.id);
                if (state.currentTouchId !== null) {
                    touchIds.delete(settings.id);
                }
            }
        };
    };

    return {
        create: createJoystick,
        destroyAll: () => {
            instances.clear();
            touchIds.clear();
        }
    };
})();
        
const FluxaBox = (() => {
    let joystick1Instance = null;
    let joystick2Instance = null;
    const buttonStates = {
        up: false, left: false, right: false, down: false,
        f: false, l: false, u: false, x: false,
        start: false, b: false, o: false
    };
    const buttonCallbacks = {};
    const activeButtons = new Set();
    let pollInterval = null;
    const POLL_RATE = 100;
  
    const defaultStyles = {
        contStart: { color: 'black', size: 39, x: '50%', y: '10px' },
        contLetter: { color: 'black', size: 39, x: 'right:10px', y: '40%' },
        contB: { color: 'black', size: 39, x: '50%', y: '-30%' },
        contO: { color: 'black', size: 39, x: '50%', y: '-30%' },
        contArrows: { color: 'black', size: 39, x: 'left:10px', y: '40%' },
        contAlls: { color: 'black', size: 39 }
    };
    
    const dpadContainer = document.createElement('div');
    const buttonContainer = document.createElement('div');
    const startButtonContainer = document.createElement('div');
  
    const setupContainers = () => {
        dpadContainer.style.position = 'absolute';
        dpadContainer.style.width = '120px';
        dpadContainer.style.height = '120px';
        
        buttonContainer.style.position = 'absolute';
        buttonContainer.style.width = '120px';
        buttonContainer.style.height = '120px';
        
        startButtonContainer.style.position = 'absolute';
        startButtonContainer.style.zIndex = '1000';

        updateContainerPosition('contArrows', defaultStyles.contArrows);
        updateContainerPosition('contLetter', defaultStyles.contLetter);
        updateContainerPosition('contStart', defaultStyles.contStart);
    };

    const updateContainerPosition = (containerId, config) => {
        const container = getContainerElement(containerId);
        if (!container) return;

        if (config.x) {
            if (config.x.includes(':')) {
                const [position, value] = config.x.split(':');
                container.style[position] = value;
                container.style.left = position === 'right' ? 'auto' : value;
                container.style.right = position === 'left' ? 'auto' : value;
            } else {
                container.style.left = config.x;
                container.style.right = 'auto';
            }
        }

        if (config.y) {
            container.style.top = config.y;
            container.style.transform = 'translateY(-50%)';
        }
    };

    const getContainerElement = (containerId) => {
        switch (containerId) {
            case 'contStart': return startButtonContainer;
            case 'contLetter': return buttonContainer;
            case 'contArrows': return dpadContainer;
            default: return null;
        }
    };

    const updateButtonStyles = (container, config) => {
        const buttons = container.getElementsByTagName('div');
        for (let button of buttons) {
            if (config.color) button.style.backgroundColor = config.color;
            if (config.size) {
                button.style.width = `${config.size}px`;
                button.style.height = `${config.size}px`;
            }
        }
    };
   
    const btnEdit = (containerId, config) => {
        const container = getContainerElement(containerId);
        if (!container) return;

        if (containerId === 'contAlls') {            
            const allContainers = [dpadContainer, buttonContainer, startButtonContainer];
            allContainers.forEach(cont => updateButtonStyles(cont, config));
            return;
        }

        updateContainerPosition(containerId, config);
        updateButtonStyles(container, config);
      
        defaultStyles[containerId] = {
            ...defaultStyles[containerId],
            ...config
        };
    };

    const buttonSpacing = 3;

    const pollActiveButtons = () => {
        activeButtons.forEach(id => {
            if (buttonCallbacks[id]) buttonCallbacks[id]();
        });
    };

    const startPolling = () => {
        if (!pollInterval) {
            pollInterval = setInterval(pollActiveButtons, POLL_RATE);
        }
    };

    const stopPolling = () => {
        if (pollInterval && activeButtons.size === 0) {
            clearInterval(pollInterval);
            pollInterval = null;
        }
    };

const createSegment = (text, top, left, id, isStart = false) => {
    const segment = document.createElement('div');
    segment.textContent = text;
    segment.style.position = 'absolute';
    segment.style.top = top;
    segment.style.left = left;
    segment.style.transform = 'translate(-50%, -50%)';
    segment.style.fontSize = isStart ? '14px' : '16px';
    segment.style.fontWeight = 'bold';
    segment.style.color = 'white';
    segment.style.width = isStart ? '60px' : `${defaultStyles.contAlls.size}px`;
    segment.style.height = `${defaultStyles.contAlls.size}px`;
    segment.style.borderRadius = isStart ? '10px' : '50%';
    segment.style.display = 'flex';
    segment.style.alignItems = 'center';
    segment.style.justifyContent = 'center';
    segment.style.backgroundColor = defaultStyles.contAlls.color;
    segment.style.cursor = 'pointer';
    segment.style.webkitTapHighlightColor = 'transparent';
    segment.style.touchAction = 'none';
    segment.style.border = '2px solid gray';
    segment.style.transition = 'background-color 0.2s ease';
    segment.dataset.id = id;
   
    segment.addEventListener('mousedown', () => {
        segment.style.backgroundColor = '#808080';
    });
    segment.addEventListener('touchstart', () => {
        segment.style.backgroundColor = '#808080';
    });
  
    segment.addEventListener('mouseup', () => {
        segment.style.backgroundColor = defaultStyles.contAlls.color;
    });
    segment.addEventListener('touchend', () => {
        segment.style.backgroundColor = defaultStyles.contAlls.color;
    });

    const handleButtonPress = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!activeButtons.has(id)) {
            activeButtons.add(id);
            buttonStates[id] = true;
            if (buttonCallbacks[id]) buttonCallbacks[id]();
            startPolling();
        }
    };
    

        const handleButtonRelease = (e) => {
            e.preventDefault();
            e.stopPropagation();
            activeButtons.delete(id);
            buttonStates[id] = false;
            stopPolling();
        };

        segment.addEventListener('mousedown', handleButtonPress, { passive: false });
        segment.addEventListener('mouseup', handleButtonRelease, { passive: false });
        segment.addEventListener('mouseleave', handleButtonRelease, { passive: false });
        segment.addEventListener('touchstart', handleButtonPress, { passive: false });
        segment.addEventListener('touchend', handleButtonRelease, { passive: false });
        segment.addEventListener('touchcancel', handleButtonRelease, { passive: false });

        return segment;
    };

    document.addEventListener('touchmove', (e) => {
        if (activeButtons.size > 0) e.preventDefault();
    }, { passive: false });

    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.msUserSelect = 'none';

    setupContainers();

    return {
        btns: () => {dpadContainer.appendChild(createSegment('↑', `${20 + buttonSpacing}%`, '50%', 'up'));
            dpadContainer.appendChild(createSegment('←', '50%', `${20 + buttonSpacing}%`, 'left'));
            dpadContainer.appendChild(createSegment('→', '50%', `${80 - buttonSpacing}%`, 'right'));
            dpadContainer.appendChild(createSegment('↓', `${80 - buttonSpacing}%`, '50%', 'down'));
            dpadContainer.appendChild(createSegment('B', '-30%', '50%', 'b'));
            document.body.appendChild(dpadContainer);
                       buttonContainer.appendChild(createSegment('F', `${20 + buttonSpacing}%`, '50%', 'f'));
            buttonContainer.appendChild(createSegment('L', '50%', `${20 + buttonSpacing}%`, 'l'));
            buttonContainer.appendChild(createSegment('U', '50%', `${80 - buttonSpacing}%`, 'u'));
            buttonContainer.appendChild(createSegment('X', `${80 - buttonSpacing}%`, '50%', 'x'));
            buttonContainer.appendChild(createSegment('O', '-30%', '50%', 'o'));
            document.body.appendChild(buttonContainer);         
            startButtonContainer.appendChild(createSegment('START', '50%', '50%', 'start', true));
            document.body.appendChild(startButtonContainer);
        },

        btnEdit: btnEdit,
        btn: (button, callback) => {
            if (callback) buttonCallbacks[button] = callback;
        },
        btnState: (button) => buttonStates[button] || false,

        joysticks: (options = {}) => {
            const defaultOptions1 = {
                id: 'joystick1',
                position: { bottom: '20px', left: '20px' }
            };
            const defaultOptions2 = {
                id: 'joystick2',
                position: { bottom: '20px', right: '20px' }
            };
            joystick1Instance = Joystick.create({ ...defaultOptions1, ...options });
            joystick2Instance = Joystick.create({ ...defaultOptions2, ...options });
        },

        joystick1: () => joystick1Instance ? joystick1Instance.getState() : null,
        joystick2: () => joystick2Instance ? joystick2Instance.getState() : null,

        destroy: () => {
            if (joystick1Instance) joystick1Instance.destroy();
            if (joystick2Instance) joystick2Instance.destroy();
            joystick1Instance = null;
            joystick2Instance = null;
            if (pollInterval) {
                clearInterval(pollInterval);
                pollInterval = null;
            }
            document.body.removeChild(dpadContainer);
            document.body.removeChild(buttonContainer);
            document.body.removeChild(startButtonContainer);
            activeButtons.clear();
            Joystick.destroyAll();
        }
    };
})();

FluxaBox.joysticks()
FluxaBox.btns()
