* **add** *name* – adds a resource 'name' to the registry.
* **status** *[name]* – returns status of a resource. Name parameter is optional. Partial matches are possible; e.g. 'status qa' returns status for all resources starting with 'qa' (qa-a, qa-b etc.).
* **free?** *[name]* – returns a list of envs not taken by anyone. Name parameter is optional, can be used to filter options by prefix (e.g. 'qa').
* **take** *name* - attempts to book a resource.
* **seize** *name* - (pronounced [siːz]) Forcefully takes ownership on the env. To be used ONLY in cases when the original owner is not reachable, or can't release the env on their own. Be nice to each other and always try to reach an agreement first :)
* **release** *[name]* – releases previously booked resource. Only 'owner' can release a resource. Omitting name parameter will release all your envs.
* **help** – displays this help.
