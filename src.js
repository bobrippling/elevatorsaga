{
	init: (elevators, floors) => {
		let inDemands = [];
		let outDemands = [];

		for(const floor of floors){
			const n = floor.floorNum();
			const onButton = dir => {
				inDemands.push({ from: n, dir });
				console.log(`request from floor ${n}`, inDemands);
			};
			floor.on("up_button_pressed", () => onButton("up"));
			floor.on("down_button_pressed", () => onButton("down"));
		}

		for(const e of elevators){
			e.on("idle", () => {
				const handleRequest = () => {
					const dest = inDemands.shift();
					if (dest == null)
						return;

					console.log(`idle, picking up from floor ${dest.from}`)
					e.goToFloor(dest.from);
					return true;
				}
				const handleDropoff = () => {
					const out = outDemands.shift();
					if(out == null)
						return;

					console.log(`idle, moving passenger to floor ${out.to}`)
					e.goToFloor(out.to);
					return true;
				}

				if (handleRequest())
					return;
				if (handleDropoff())
					return;
			});
			e.on("stopped_at_floor", floorNum => {
				console.log(`stopped at floor ${floorNum}`);

				const remove = (l, proj) => l.filter((ent) => proj(ent) !== floorNum);
				inDemands = remove(inDemands, ({ from }) => from);
				outDemands = remove(outDemands, ({ to }) => to);
			});
			e.on("floor_button_pressed", floorNum => {
				console.log(`demand to move to ${floorNum}`);

				outDemands.push({ to: floorNum });
			});
		}
	},
		update: (dt, elevators, floors) => {},
}
