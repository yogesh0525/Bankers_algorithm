
    // ===== DASHBOARD EXECUTION HELPERS =====
    let executionSteps = [];
    let executionSafeSequence = [];
    let executionIsSafe = false;

    function recordExecutionStep(stepNumber, processId, workBefore, workAfter, allocation) {
        executionSteps.push({
            step: stepNumber,
            process: processId,
            workBefore: [...workBefore],
            workAfter: [...workAfter],
            allocation: [...allocation]
        });
    }

    function displayExecutionDashboard(isSafe, safeSequence, initialWork, allocation, maximum) {
        executionIsSafe = isSafe;
        executionSafeSequence = safeSequence;

        const dashboard = document.getElementById('executionDashboard');
        dashboard.style.display = 'block';

        // Update status card
        const statusDiv = document.getElementById('executionStatus');
        if (isSafe) {
            statusDiv.innerHTML = '<div class="status-badge status-safe">✓ SAFE STATE</div>';
        } else {
            statusDiv.innerHTML = '<div class="status-badge status-unsafe">✗ UNSAFE STATE</div>';
        }

        // Update safe sequence card
        const sequenceDiv = document.getElementById('executionSequence');
        if (isSafe && safeSequence.length > 0) {
            let sequenceHTML = '';
            safeSequence.forEach((processId, index) => {
                const colorClass = `process-badge-p${processId % 8}`;
                sequenceHTML += `<span class="process-badge ${colorClass}">P${processId}</span>`;
                if (index < safeSequence.length - 1) {
                    sequenceHTML += '<span class="process-arrow">→</span>';
                }
            });
            sequenceDiv.innerHTML = sequenceHTML;
        } else {
            sequenceDiv.innerHTML = '<p class="placeholder">No safe sequence available</p>';
        }

        // Display execution steps
        displayExecutionSteps();
    }

    function displayExecutionSteps() {
        const stepsDiv = document.getElementById('executionSteps');
        stepsDiv.innerHTML = '';

        if (executionSteps.length === 0) {
            stepsDiv.innerHTML = '<p class="placeholder">No execution steps recorded</p>';
            return;
        }

        executionSteps.forEach(step => {
            const stepCard = document.createElement('div');
            stepCard.className = 'execution-step';

            const stepNumber = document.createElement('span');
            stepNumber.className = 'step-number';
            stepNumber.textContent = step.step;

            const stepContent = document.createElement('div');
            stepContent.className = 'step-content';

            const processLine = document.createElement('div');
            processLine.className = 'step-process';
            processLine.innerHTML = `<span class="step-process-name">P${step.process}</span> executed`;

            const stepInfo = document.createElement('div');
            stepInfo.className = 'step-info';

            const workBeforeItem = document.createElement('div');
            workBeforeItem.className = 'step-info-item';
            workBeforeItem.innerHTML = `<span class="step-info-label">Work Before:</span><span class="step-info-value">[${step.workBefore.join(', ')}]</span>`;

            const workAfterItem = document.createElement('div');
            workAfterItem.className = 'step-info-item';
            workAfterItem.innerHTML = `<span class="step-info-label">Work After:</span><span class="step-info-value">[${step.workAfter.join(', ')}]</span>`;

            const allocationItem = document.createElement('div');
            allocationItem.className = 'step-info-item';
            allocationItem.innerHTML = `<span class="step-info-label">Allocation Released:</span><span class="step-info-value">[${step.allocation.join(', ')}]</span>`;

            stepInfo.appendChild(workBeforeItem);
            stepInfo.appendChild(workAfterItem);
            stepInfo.appendChild(allocationItem);

            stepContent.appendChild(processLine);
            stepContent.appendChild(stepInfo);

            stepCard.appendChild(stepNumber);
            stepCard.appendChild(stepContent);

            stepsDiv.appendChild(stepCard);
        });
    }

    function createMatrixInput(matrixType) {
        const processes = parseInt(document.getElementById('processes').value);
        const resources = parseInt(document.getElementById('resources').value);

        const matrixTable = document.getElementById(matrixType + 'Matrix');
        matrixTable.innerHTML = '';

        for (let i = 0; i < processes; i++) {
            const row = matrixTable.insertRow(-1);

            for (let j = 0; j < resources; j++) {
                const cell = row.insertCell(-1);
                const input = document.createElement('input');
                input.type = 'text';
                input.name = `${matrixType}[${i}][${j}]`;
                cell.appendChild(input);
            }
        }
    }

    function createAvailableResourcesInput() {
        const resources = parseInt(document.getElementById('resources').value);

        const availableTable = document.getElementById('availableResources');
        availableTable.innerHTML = '<tr><td>Available Resources:</td></tr>';

        const row = availableTable.insertRow(-1);

        for (let i = 0; i < resources; i++) {
            const cell = row.insertCell(-1);
            const input = document.createElement('input');
            input.type = 'text';
            input.name = `available[${i}]`;
            input.placeholder = `Available ${i + 1}`;
            cell.appendChild(input);
        }
    }

    function runBankersAlgorithm() {
		const processes = parseInt(document.getElementById('processes').value);
		const resources = parseInt(document.getElementById('resources').value);
	
		const allocation = [];
		const maximum = [];
		const available = [];
	
		for (let i = 0; i < processes; i++) {
			allocation[i] = [];
			maximum[i] = [];
			for (let j = 0; j < resources; j++) {
				allocation[i][j] = parseInt(document.querySelector(`input[name="allocation[${i}][${j}]"]`).value);
				maximum[i][j] = parseInt(document.querySelector(`input[name="maximum[${i}][${j}]"]`).value);
			}
		}
	
		for (let i = 0; i < resources; i++) {
			available[i] = parseInt(document.querySelector(`input[name="available[${i}]"]`).value);
		}
	
		// Reset execution tracking
		executionSteps = [];
		executionSafeSequence = [];
		
		const work = [...available];
		const initialWork = [...available]; // Store initial work for display
		const finish = new Array(processes).fill(false);
		const safeSequence = [];
		let isSafe = true;
		let stepCounter = 1;
	
		let found;
		do {
			found = false;
			for (let i = 0; i < processes; i++) {
				if (!finish[i]) {
					let canExecute = true;
					for (let j = 0; j < resources; j++) {
						if (maximum[i][j] - allocation[i][j] > work[j]) {
							canExecute = false;
							break;
						}
					}
	
					if (canExecute) {
						// Record work BEFORE execution
						const workBefore = [...work];
						
						// Execute: add allocation to work
						for (let j = 0; j < resources; j++) {
							work[j] += allocation[i][j];
						}
						
						// Record execution step
						recordExecutionStep(stepCounter, i, workBefore, work, allocation[i]);
						stepCounter++;
						
						finish[i] = true;
						safeSequence.push(i);
						found = true;
					}
				}
			}
		} while (found);
	
		for (let i = 0; i < processes; i++) {
			if (!finish[i]) {
				isSafe = false;
				break;
			}
		}
	
		const resultDiv = document.getElementById('result');
		if (isSafe) {
			const safeSequenceString = safeSequence.join(" -> ");
			resultDiv.innerHTML = `Safe sequence: ${safeSequenceString}<br>System is safe.`;
		} else {
			resultDiv.innerHTML = "No safe sequence exists.<br>System is not safe.";
		}
		displayNeedMatrix(allocation, maximum);
		
		// Display execution dashboard
		displayExecutionDashboard(isSafe, safeSequence, initialWork, allocation, maximum);
	}
	
    function displayNeedMatrix(allocation, maximum) {
        const processes = allocation.length;
        const resources = allocation[0].length;

        const needMatrix = [];
        for (let i = 0; i < processes; i++) {
            needMatrix[i] = [];
            for (let j = 0; j < resources; j++) {
                needMatrix[i][j] = maximum[i][j] - allocation[i][j];
            }
        }

        const needMatrixDiv = document.getElementById('needMatrixDiv');
        needMatrixDiv.innerHTML = '<h2>Need Matrix:</h2>';

        const table = document.createElement('table');
        needMatrixDiv.appendChild(table);

        // Create table headers
        const headerRow = table.insertRow(0);
        for (let j = 0; j < resources; j++) {
            const headerCell = headerRow.insertCell(j);
            headerCell.innerHTML = `<b>Resource ${j + 1}</b>`;
        }

        // Populate the table with need matrix values
        for (let i = 0; i < processes; i++) {
            const row = table.insertRow(-1);
            for (let j = 0; j < resources; j++) {
                const cell = row.insertCell(j);
                cell.innerHTML = needMatrix[i][j];
            }
        }
    }
	

    function updateProcessSelector() {
        const processes = parseInt(document.getElementById('processes').value) || 0;
        const requestProcess = document.getElementById('requestProcess');
        requestProcess.innerHTML = '<option value="">Select Process</option>';
        
        for (let i = 0; i < processes; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `P${i}`;
            requestProcess.appendChild(option);
        }
    }

    function updateRequestInputs() {
        const resources = parseInt(document.getElementById('resources').value) || 0;
        const container = document.getElementById('requestInputsContainer');
        container.innerHTML = '';
        
        for (let i = 0; i < resources; i++) {
            const div = document.createElement('div');
            div.className = 'input-group';
            
            const label = document.createElement('label');
            label.textContent = `Resource ${i + 1}`;
            label.style.fontSize = '0.9rem';
            label.style.color = '#2c3e50';
            
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'input-field';
            input.name = `request[${i}]`;
            input.placeholder = `Request R${i}`;
            input.value = '0';
            input.min = '0';
            
            div.appendChild(label);
            div.appendChild(input);
            container.appendChild(div);
        }
    }

    function calculateSafetyAfterRequest(tempAllocation, tempMaximum, tempAvailable) {
        const processes = tempAllocation.length;
        const resources = tempAllocation[0].length;
        
        const work = [...tempAvailable];
        const finish = new Array(processes).fill(false);
        const safeSequence = [];
        let isSafe = true;
        
        let found;
        do {
            found = false;
            for (let i = 0; i < processes; i++) {
                if (!finish[i]) {
                    let canExecute = true;
                    for (let j = 0; j < resources; j++) {
                        if (tempMaximum[i][j] - tempAllocation[i][j] > work[j]) {
                            canExecute = false;
                            break;
                        }
                    }
                    
                    if (canExecute) {
                        for (let j = 0; j < resources; j++) {
                            work[j] += tempAllocation[i][j];
                        }
                        finish[i] = true;
                        safeSequence.push(i);
                        found = true;
                    }
                }
            }
        } while (found);
        
        for (let i = 0; i < processes; i++) {
            if (!finish[i]) {
                isSafe = false;
                break;
            }
        }
        
        return { isSafe, safeSequence };
    }

    function displayRequestResult(isSafe, processId, request, tempAllocation, tempMaximum, tempAvailable, safeSequence) {
        const resultDiv = document.getElementById('requestResult');
        const detailsSection = document.getElementById('requestDetailsSection');
        const processes = parseInt(document.getElementById('processes').value);
        const resources = parseInt(document.getElementById('resources').value);
        
        resultDiv.innerHTML = '';
        resultDiv.className = 'request-result';
        resultDiv.classList.add(isSafe ? 'safe' : 'unsafe');
        
        const statusText = isSafe ? 'APPROVED' : 'DENIED';
        const statusIcon = isSafe ? '✅' : '❌';
        const statusMessage = isSafe ? 'SAFE STATE' : 'UNSAFE STATE';
        
        const resultHTML = `
            <div>${statusIcon} ${statusText} - ${statusMessage}</div>
            <span class="status-badge ${isSafe ? 'safe' : 'unsafe'}">${isSafe ? 'SAFE' : 'UNSAFE'}</span>
        `;
        resultDiv.innerHTML = resultHTML;
        
        if (isSafe) {
            // Display updated matrices
            const availableDiv = document.getElementById('requestAvailableDisplay');
            const allocationDiv = document.getElementById('requestAllocationDisplay');
            const needDiv = document.getElementById('requestNeedDisplay');
            const safeSequenceDiv = document.getElementById('requestSafeSequenceDisplay');
            
            // Updated Available
            let availableHTML = '<strong>Updated Available:</strong><br>';
            availableHTML += tempAvailable.map((val, idx) => `R${idx}: ${val}`).join(' | ');
            availableDiv.innerHTML = availableHTML;
            
            // Updated Allocation
            let allocationHTML = '<strong>Updated Allocation:</strong><br>';
            for (let i = 0; i < processes; i++) {
                allocationHTML += `P${i}: `;
                allocationHTML += tempAllocation[i].map((val, idx) => `${val}`).join(', ');
                allocationHTML += '<br>';
            }
            allocationDiv.innerHTML = allocationHTML;
            
            // Updated Need
            let needHTML = '<strong>Updated Need:</strong><br>';
            for (let i = 0; i < processes; i++) {
                needHTML += `P${i}: `;
                const need = [];
                for (let j = 0; j < resources; j++) {
                    need.push(tempMaximum[i][j] - tempAllocation[i][j]);
                }
                needHTML += need.join(', ');
                needHTML += '<br>';
            }
            needDiv.innerHTML = needHTML;
            
            // Safe Sequence
            let seqHTML = '<strong>Safe Sequence:</strong><br>';
            seqHTML += safeSequence.map(i => `P${i}`).join(' → ');
            safeSequenceDiv.innerHTML = seqHTML;
            
            detailsSection.style.display = 'block';
        } else {
            detailsSection.style.display = 'none';
        }
    }

    function submitResourceRequest() {
        const processes = parseInt(document.getElementById('processes').value);
        const resources = parseInt(document.getElementById('resources').value);
        const processId = parseInt(document.getElementById('requestProcess').value);
        
        if (isNaN(processId)) {
            alert('Please select a process');
            return;
        }
        
        // Get current allocation, maximum, available
        const allocation = [];
        const maximum = [];
        const available = [];
        
        for (let i = 0; i < processes; i++) {
            allocation[i] = [];
            maximum[i] = [];
            for (let j = 0; j < resources; j++) {
                allocation[i][j] = parseInt(document.querySelector(`input[name="allocation[${i}][${j}]"]`).value) || 0;
                maximum[i][j] = parseInt(document.querySelector(`input[name="maximum[${i}][${j}]"]`).value) || 0;
            }
        }
        
        for (let i = 0; i < resources; i++) {
            available[i] = parseInt(document.querySelector(`input[name="available[${i}]"]`).value) || 0;
        }
        
        // Get requested resources
        const request = [];
        for (let i = 0; i < resources; i++) {
            request[i] = parseInt(document.querySelector(`input[name="request[${i}]"]`).value) || 0;
        }
        
        // Validation: Request <= Need
        for (let i = 0; i < resources; i++) {
            const need = maximum[processId][i] - allocation[processId][i];
            if (request[i] > need) {
                alert(`Request for Resource ${i} exceeds Need (Need: ${need}, Requested: ${request[i]})`);
                return;
            }
        }
        
        // Validation: Request <= Available
        for (let i = 0; i < resources; i++) {
            if (request[i] > available[i]) {
                alert(`Request for Resource ${i} exceeds Available (Available: ${available[i]}, Requested: ${request[i]})`);
                return;
            }
        }
        
        // Create temporary state
        const tempAllocation = allocation.map(row => [...row]);
        const tempAvailable = [...available];
        const tempMaximum = maximum.map(row => [...row]);
        
        // Apply request to temporary state
        for (let i = 0; i < resources; i++) {
            tempAllocation[processId][i] += request[i];
            tempAvailable[i] -= request[i];
        }
        
        // Run safety check
        const result = calculateSafetyAfterRequest(tempAllocation, tempMaximum, tempAvailable);
        
        // Display result
        displayRequestResult(result.isSafe, processId, request, tempAllocation, tempMaximum, tempAvailable, result.safeSequence);
    }

    document.getElementById('processes').addEventListener('blur', function () {
        createMatrixInput('allocation');
        createMatrixInput('maximum');
        createAvailableResourcesInput();
        updateProcessSelector();
        updateRequestInputs();
    });

    document.getElementById('resources').addEventListener('blur', function () {
        createMatrixInput('allocation');
        createMatrixInput('maximum');
        createAvailableResourcesInput();
        updateRequestInputs();
    });

    createAvailableResourcesInput();
    updateProcessSelector();
    updateRequestInputs();
