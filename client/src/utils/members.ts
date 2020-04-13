export function createMember(inputs: any, callback: Function): void {
  fetch("/api/members/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }, body: JSON.stringify({ inputs })
  })
    .then(res => res.json())
    .then(res => {
      callback(res);
    },
    err => {
      return;
    }
  )
}

export function editMember(_id: string, inputs: any, callback: Function): void {
  fetch("/api/members/edit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }, body: JSON.stringify({ _id, inputs })
  })
    .then(res => res.json())
    .then(res => {
      callback(res);
    },
    err => {
      return;
    }
  )
}

export function completeMember(_id: string, callback: Function): void {
  fetch("/api/members/complete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }, body: JSON.stringify({ _id })
  })
    .then(res => res.json())
    .then(res => {
      callback(res);
    },
    err => {
      return;
    }
  )
}

export function revertMember(_id: string, callback: Function): void {
  fetch("/api/members/revert", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }, body: JSON.stringify({ _id })
  })
    .then(res => res.json())
    .then(res => {
      callback(res);
    },
    err => {
      return;
    }
  )
}

export function requestMember(_id: string, inputs: any, callback: Function): void {
  fetch("/api/members/request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }, body: JSON.stringify({ _id, inputs })
  })
    .then(res => res.json())
    .then(res => {
      callback(res);
    },
    err => {
      return;
    }
  )
}

export function queryMembers(callback: Function): void {
  fetch("/api/members/query", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(res => res.json())
    .then(res => {
      callback(res);
    },
    err => {
      return;
    }
  )
}

export function queryStats(callback: Function): void {
  fetch("/api/members/Stats", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(res => res.json())
    .then(res => {
      callback(res);
    },
    err => {
      return;
    }
  )
}