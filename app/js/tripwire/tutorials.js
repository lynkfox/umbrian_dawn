var tutorial;

// infoWidget
$("#infoWidget .tutorial").click(function() {
    tutorial = introJs().setOptions({
        showStepNumbers: false,
        steps: [
            {
                element: document.querySelector("#infoWidget"),
                intro: "<h4>System information widget</h4><br/><p>Displays information on the currently <b>selected</b> Tripwire system (not the in-game system).</p>"
            },
            {
                element: document.querySelector("#infoGeneral"),
                intro: "<p>This section includes the system name, security rating, region, and owning faction.</p>"
            },
            {
                element: document.querySelector("#activityGraph"),
                intro: "<p>This is the graph containing historical ship jump and kill information.</p>"
            },
            {
                element: $("#activityGraph svg > g > g:nth-child(5)")[0],
                intro: "<p>Each value can be toggled by clicking these keys to drill down the graph into finer detail.</p>"
            },
            {
                element: document.querySelector("#activityGraphControls"),
                intro: "<p>Select different lengths of historical data to show</p>"
            },
            {
                element: document.querySelector("#infoStatics"),
                intro: "<p>If a wormhole system is selected, the static wormholes will appear here.</p>"
            },
            {
                element: document.querySelector("#infoLinks"),
                intro: "<p>These are some quick links to various sites for this specific system.</p>"
            }
        ]
    }).start();
});

// signaturesWidget
$("#signaturesWidget .tutorial").click(function() {
    tutorial = introJs().setOptions({
        showStepNumbers: false,
        steps: [
            {
                element: document.querySelector("#signaturesWidget"),
                intro: "<h4>System signatures widget</h4><br/><p>Displays all signatures and wormholes in the currently <b>selected</b> Tripwire system (not the in-game system).</p>"
            },
            {
                element: document.querySelector("#add-signature2"),
                intro: "<p>Add new signatures or wormholes manually by clicking the + icon.</p>"
            },
            {
                element: document.querySelector("#toggle-automapper"),
                intro: "<p>Toggle the Auto-mapper feature on (orange) or off. (more details here)</p>"
            },
            {
                element: document.querySelector("#signature-count"),
                intro: "<p>Shows the current count of signatures.</p>"
            },
            {
                element: document.querySelector("#undo"),
                intro: "<p>Click or use the keyboard shortcut CTRL-Z to undo the last changes made to these signatures (this includes clipboard pasted changes).</p><br/><p>You can undo multiple times as history is kept in the browser.</p>"
            },
            {
                element: document.querySelector("#redo"),
                intro: "<p>Click or use the keyboard shortcut CTRL-Y to redo the last changes made to these signatures (this includes clipboard pasted changes).</p><br/><p>You can redo multiple times as history is kept in the browser.</p>"
            },
            {
                element: document.querySelector("#sigTable"),
                intro: "<p>Each column can be sorted by clicking the column label, sort by multiple columns by holding the shift key.</p><br/><p>Right-click a column to change the text-alignment.</p>"
            }
        ]
    }).start();
});

// notesWidget
$("#notesWidget .tutorial").click(function(e) {
    e.preventDefault();

    tutorial = introJs().setOptions({
        showStepNumbers: false,
        exitOnEsc: false,
        exitOnOverlayClick: false,
        skipLabel: "Abort",
        steps: [
            {
                element: document.querySelector("#notesWidget"),
                intro: "<h4>System notes widget</h4><br/><p>Displays comments based on the currently <b>selected</b> Tripwire system (not the in-game system).</p><br/><p>The rest of this tutorial will guide you through actually adding a comment, but don't worry we will switch you to your private Tripwire mask so we don't disturb anyone else.</p><br/><p>When you finish or leave this tutorial we will switch you back to your previous Tripwire mask.</p>"
            },
            {
                element: document.querySelector("#add-comment"),
                intro: "<p>Now click the + icon to begin adding a new comment in this system (" + viewingSystem + ").</p>"
            },
            {
                element: document.querySelector("#notesWidget"),
                intro: "<p>Type some basic text now and click save.</p>"
            },
            {
                element: document.querySelector("#notesWidget"),
                intro: "<p>This is our newly created comment. Hover over the comment with your mouse to see additional information and controls.</p>"
            },
            {
                element: document.querySelector("#notesWidget"),
                intro: "<p>You can click the 'pin' or 'sticky' button to toggle showing this comment for every system, not just this system.</p>"
            },
            {
                element: document.querySelector("#notesWidget"),
                intro: "<p>Use the <b>Edit</b> to modify a comment and <b>Delete</b> to remove a comment.</p><br/><p>You can also quickly edit any comment by simply doubling clicking anywhere on it.</p>"
            },
            {
                element: document.querySelector("#notesWidget"),
                intro: "<p>Click on the <b>Edit</b> now on our comment.</p>"
            },
            {
                element: document.querySelector("#notesWidget"),
                intro: "<p>The toolbar at the top allows you to customize your notes.</p><br/><p>You can also click on the <b>Maximize/Minimize</b> button (the far right toolbar icon) to edit this comment in full screen mode.</p><br/><p>In full screen mode you will see 1 new button added to the toolbar to view the source code of the comment where you can write HTML, CSS, and even Javascript in your notes!</p>"
            },
            {
                element: document.querySelector("#notesWidget"),
                intro: "<p>This concludes the tutorial, we will now switch you back to your previous Tripwire mask and delete the comment we created.</p>"
            }
        ]
    }).start();

    tutorial.onchange(function(element) {
        switch(tutorial._currentStep) {
            case 1:
                $(".introjs-prevbutton, .introjs-nextbutton").hide();

                console.log("switch mask to private");
                tutorial.previousMask = options.masks.active;
                options.masks.active = options.character.id + ".1";
                options.save();

                tutorial.stepFunc = function() {
                    setTimeout(function() {
                        tutorial._options.steps[2].element = $("#notesWidget").find(".comment:has(.cke_toolbar)")[0];
                        tutorial.setOption("steps", tutorial._options.steps);

                        tutorial.exiting = false;
                        tutorial.exit().start().goToStep(3);
                        tutorial.exiting = true;
                    }, 200);
                }

                $("#notesWidget #add-comment").on("click", tutorial.stepFunc);
                break;
            case 2:
                $(".introjs-prevbutton, .introjs-nextbutton").hide();
                $("#notesWidget #add-comment").off("click", tutorial.stepFunc);

                tutorial.stepFunc = function() {
                    tutorial.comment = $(this).closest(".comment");
                    setTimeout(function() {
                        tutorial._options.steps[3].element = tutorial.comment[0];
                        tutorial._options.steps[4].element = tutorial.comment.find(".commentSticky")[0];
                        tutorial._options.steps[5].element = tutorial.comment.find(".commentControls")[0];
                        tutorial._options.steps[6].element = tutorial.comment.find(".commentControls")[0];
                        tutorial.setOption("steps", tutorial._options.steps);

                        tutorial.exiting = false;
                        tutorial.exit().start().goToStep(4);
                        tutorial.exiting = true;
                    }, 200);
                }

                $("#notesWidget").on("click", ".commentSave", tutorial.stepFunc);
                break;
            case 6:
                $(".introjs-prevbutton, .introjs-nextbutton").hide();
                $("#notesWidget").off("click", ".commentSave", tutorial.stepFunc);

                tutorial.stepFunc = function() {
                    setTimeout(function() {
                        tutorial._options.steps[7].element = $("#notesWidget").find(".comment:has(.cke_toolbar)")[0];
                        tutorial._options.steps[8].element = $("#notesWidget").find(".comment:has(.cke_toolbar)")[0];
                        tutorial.setOption("steps", tutorial._options.steps);

                        tutorial.exiting = false;
                        tutorial.exit().start().goToStep(8);
                        tutorial.exiting = true;
                    }, 200);
                }

                $("#notesWidget").on("click", ".commentEdit", tutorial.stepFunc);
                break;
        }
    });

    tutorial.onexit(function() {
        if (tutorial.exiting) {
            $(".commentCancel:visible").click();
            // delete the tutorial comment that was created
            if (tutorial.comment) {
                var data = {"mode": "delete", "commentID": tutorial.comment.data("id")};

                $.ajax({
                    url: "comments.php",
                    type: "POST",
                    data: data,
                    dataType: "JSON"
                }).done(function(data) {
                    if (data && data.result == true) {
                        tutorial.comment.remove();
                    }
                });
            }

            if (tutorial.previousMask) {
                setTimeout(function() {
                    console.log("change mask back, delete comment", tutorial.previousMask);
                    options.masks.active = tutorial.previousMask;
                    options.save();
                }, 200);
            }

            // remove event listeners
            $("#notesWidget #add-comment").off("click", tutorial.stepFunc);
            $("#notesWidget").off("click", ".commentSave", tutorial.stepFunc);
            $("#notesWidget").off("click", ".commentEdit", tutorial.stepFunc);
            $("#notesWidget").off("click", ".cke_toolgroup:has(.cke_button__toolbarswitch)", tutorial.stepFunc);
        }
    });

    tutorial.previousMask;
    tutorial.comment;
    tutorial.stepFunc;
    tutorial.exiting = true;
});
