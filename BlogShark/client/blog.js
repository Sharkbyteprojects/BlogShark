/*
 * This code is property of Sharkbyteprojets
 * (c) Sharkbyteprojects
 * Only for Sharkblog
 * */
(function () {
    const errmessagenone = `<h1 class="alert alert-warning">OOOPS, we can't find anything! <button class="retry">Try again</button></h1>`;

    function errmsg(retryf) {
        $("div.entrys").html(errmessagenone);
        $("button.retry").click(() => {
            $("div.entrys").html("Reloading");
            retryf();
        });
    }

    var token = "";
    $(document).ready(() => {
        $.get("/format.xml", formattingx => {
            const formatting = formattingx.replace('<?xml version="1.0" encoding="utf-8" ?>', "");
            const hash = document.location.hash.replace("#", "");
            let toget = {};

            if (hash != "") {
                toget = {
                    id: hash
                };
            }
            function getit(login) {
                $.get("/api", toget, data => {
                    if (data.err) {
                        console.error(data.err);
                        errmsg(() => {
                            console.log("Retry");
                            getit();
                        });
                    } else {
                        let x = data.data;

                        if (x.length != 0) {
                            $("div.entrys").html("");

                            if (login) {
                                let y = x;
                                y = y.reverse();
                                y.push({
                                    id: 0,
                                    date: "NONE",
                                    content: `<form class="add form-inline"><input class="form-control add h" type="text" placeholder="Head"><input class="c form-control add" type="text" placeholder="Content"><button type="submit" class="btn btn-success">Add</button></form>`,
                                    head: "Add Entry"
                                });
                                x = y.reverse();
                            }

                            for (let entry of x) {
                                let xss = "";

                                if (login) {
                                    if (entry.id != 0) {
                                        xss += `<button class="btn btn-danger entry${entry.id}">Delete ${entry.id}</button>`;
                                    }
                                }

                                const end = `${formatting.split("$id$").join(entry.id).split("$date$").join(` | Date: ${entry.date}`).split("$content$").join(entry.content).split("$header$").join(entry.head).replace("$rms$", xss)}`;
                                $("div.entrys").append(end);

                                if (login) {
                                    $(`button.btn.btn-danger.entry${entry.id}`).click(() => {
                                        $.ajax({
                                            url: '/api',
                                            type: 'DELETE',
                                            success: function (result) {
                                                alert(result);
                                            },
                                            data: {
                                                token: token,
                                                id: entry.id
                                            }
                                        });
                                        getit(login);
                                    });
                                }
                            }
                            if (login) {
                                $("form.add").submit(e => {
                                    e.preventDefault();
                                    $.post("/api", {
                                        token: token,
                                        head: $("input.add.h").val(),
                                        data: $("input.add.c").val()
                                    }, () => {
                                        getit(login);
                                    }, "text");
                                    e.preventDefault();
                                });
                            }
                        } else {
                            errmsg(() => {
                                console.log("Retry");
                                getit(login);
                            });
                        }
                    }
                }, "json");
            }

            $("form.login").submit(e => {
                e.preventDefault();
                const pw = $("input.login").val();
                $("input.login").val("");
                $.post("/login", {
                    password: pw
                }, xa => {
                    if (xa.err) {
                        console.log("Wrong Password");
                        $("div.al").html(`<div class="alert alert-danger">You have typed in the wrong password!</div>`);
                    } else {
                        token = xa.token;
                        console.log("Succeedful Logged in");
                        $("form.login").attr("style", `display: none;`);
                        $("nav").append(`<button class="btn btn-outline-danger logoutit my-2 my-sm-0" type="submit">Logout</button>`);
                        $("button.logoutit.btn").click(() => {
                            $.get("/logout", {
                                token: token
                            });
                            document.location.reload();
                        });
                        $("div.al").html(``);
                        getit(true);
                    }
                }, "json");
                e.preventDefault();
            });
            getit(false);
        }, "text");
    });
})();