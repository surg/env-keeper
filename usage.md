* **add** *name* – adds a resource 'name' to the registry.
* **status** *[name]* – returns status of a resource. Name parameter is optional. Partial matches are possible; e.g. 'status qa' returns status for all resources starting with 'qa' (qa-a, qa-b etc.).
* **free?** *[name]* – returns a list of envs not taken by anyone. Name parameter is optional, can be used to filter options by prefix (e.g. 'qa').
* **take** *name* - attempts to book a resource.
* **release** *[name]* – releases previously booked resource. Only 'owner' can release a resource. Omitting name parameter will release all your envs.
* **help** – displays this help.
